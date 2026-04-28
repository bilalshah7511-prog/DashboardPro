import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import pool from '../config/database.js'
import { generateAccessToken, generateRefreshToken, saveRefreshToken } from '../middleware/auth.js'

// Enable 2FA - Generate secret and QR code
export const enable2FA = async (req, res) => {
  try {
    const userId = req.user.id
    const userEmail = req.user.email

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `DashPro (${userEmail})`,
      issuer: 'DashPro'
    })

    // Save secret to database (not enabled yet)
    await pool.query(
      'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
      [secret.base32, userId]
    )

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

    res.json({
      message: 'Scan this QR code with your authenticator app',
      secret: secret.base32,
      qrCode: qrCodeUrl
    })
  } catch (error) {
    console.error('Enable 2FA error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Verify 2FA code and enable it
export const verify2FA = async (req, res) => {
  try {
    const { code } = req.body
    const userId = req.user.id

    // Get user's secret
    const result = await pool.query(
      'SELECT two_factor_secret FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0 || !result.rows[0].two_factor_secret) {
      return res.status(400).json({ message: '2FA not initialized' })
    }

    const secret = result.rows[0].two_factor_secret

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    // Enable 2FA
    await pool.query(
      'UPDATE users SET two_factor_enabled = true WHERE id = $1',
      [userId]
    )

    res.json({ message: '2FA enabled successfully' })
  } catch (error) {
    console.error('Verify 2FA error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const { code } = req.body
    const userId = req.user.id

    // Get user's secret
    const result = await pool.query(
      'SELECT two_factor_secret FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0 || !result.rows[0].two_factor_secret) {
      return res.status(400).json({ message: '2FA not enabled' })
    }

    const secret = result.rows[0].two_factor_secret

    // Verify code before disabling
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    // Disable 2FA
    await pool.query(
      'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1',
      [userId]
    )

    res.json({ message: '2FA disabled successfully' })
  } catch (error) {
    console.error('Disable 2FA error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Verify 2FA during login
export const verify2FALogin = async (req, res) => {
  try {
    const { userId, code } = req.body

    // Get user's secret
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' })
    }

    const user = result.rows[0]

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return res.status(400).json({ message: '2FA not enabled for this user' })
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    // Record login
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']

    await pool.query(
      'INSERT INTO login_records (user_id, ip_address, user_agent) VALUES ($1, $2, $3)',
      [user.id, ipAddress, userAgent]
    )

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    await saveRefreshToken(user.id, refreshToken)

    // Remove sensitive data
    delete user.password
    delete user.two_factor_secret
    delete user.verification_token
    delete user.reset_token

    res.json({
      message: 'Login successful',
      user,
      accessToken,
      refreshToken
    })
  } catch (error) {
    console.error('Verify 2FA login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import { generateAccessToken, generateRefreshToken, saveRefreshToken, verifyRefreshToken, deleteRefreshToken } from '../middleware/auth.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js'
import crypto from 'crypto'

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, gender, profile_image } = req.body

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, gender, profile_image, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, gender, profile_image, created_at`,
      [name, email, hashedPassword, gender || 'Not specified', profile_image || null, verificationToken]
    )

    const user = result.rows[0]

    // Send verification email (optional - don't fail if email service is not configured)
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.log('⚠️ Verification email not sent (email service not configured):', emailError.message)
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    await saveRefreshToken(user.id, refreshToken)

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user,
      accessToken,
      refreshToken
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user with retry logic for connection issues
    let result
    try {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    } catch (dbError) {
      console.error('Database connection error during login:', dbError.message)
      return res.status(503).json({ 
        message: 'Service temporarily unavailable. Please try again in a few seconds.',
        error: 'database_connection_error'
      })
    }
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = result.rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      return res.status(200).json({
        message: '2FA required',
        requiresTwoFactor: true,
        userId: user.id
      })
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
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' })
    }

    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(userId)
    const newRefreshToken = generateRefreshToken(userId)

    // Delete old refresh token and save new one
    await deleteRefreshToken(refreshToken)
    await saveRefreshToken(userId, newRefreshToken)

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Logout
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await deleteRefreshToken(refreshToken)
    }

    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const result = await pool.query(
      'UPDATE users SET email_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id, email',
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token' })
    }

    res.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verify email error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' })
    }

    const user = result.rows[0]

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    )

    // Send reset email
    await sendPasswordResetEmail(email, resetToken)

    res.json({ message: 'If the email exists, a reset link has been sent' })
  } catch (error) {
    console.error('Request password reset error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    const user = result.rows[0]

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.id]
    )

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

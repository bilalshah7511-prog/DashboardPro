import express from 'express'
import { enable2FA, verify2FA, disable2FA, verify2FALogin } from '../controllers/twoFactorController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Public route for login verification
router.post('/verify-login', verify2FALogin)

// Protected routes
router.post('/enable', verifyToken, enable2FA)
router.post('/verify', verifyToken, verify2FA)
router.post('/disable', verifyToken, disable2FA)

export default router

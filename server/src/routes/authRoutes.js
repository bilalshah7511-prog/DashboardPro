import express from 'express'
import { register, login, logout, refreshToken, verifyEmail, requestPasswordReset, resetPassword, getCurrentUser } from '../controllers/authController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)
router.get('/verify-email/:token', verifyEmail)
router.post('/request-password-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)

// Protected routes
router.get('/me', verifyToken, getCurrentUser)

export default router

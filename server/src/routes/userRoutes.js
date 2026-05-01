import express from 'express'
import { getAllUsers, getAvailableUsers, getUserById, updateProfile, updateUser, deleteUser, getLoginRecords, getUserStats, getUserBlogStats } from '../controllers/userController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Protected routes (any authenticated user)
router.get('/available', verifyToken, getAvailableUsers)
router.get('/stats', verifyToken, getUserStats)
router.get('/login-records', verifyToken, getLoginRecords)
router.put('/profile', verifyToken, updateProfile)

// Public user stats (for hover card - any authenticated user can view)
router.get('/:id/blog-stats', verifyToken, getUserBlogStats)

// Admin only routes
router.get('/', verifyToken, isAdmin, getAllUsers)
router.get('/:id', verifyToken, isAdmin, getUserById)
router.put('/:id', verifyToken, isAdmin, updateUser)
router.delete('/:id', verifyToken, isAdmin, deleteUser)

export default router

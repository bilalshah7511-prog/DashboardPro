import express from 'express'
import { getAllUsers, getUserById, updateProfile, updateUser, deleteUser, getLoginRecords, getUserStats } from '../controllers/userController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Protected routes
router.get('/stats', verifyToken, getUserStats)
router.get('/login-records', verifyToken, getLoginRecords)
router.put('/profile', verifyToken, updateProfile)

// Admin only routes
router.get('/', verifyToken, isAdmin, getAllUsers)
router.get('/:id', verifyToken, isAdmin, getUserById)
router.put('/:id', verifyToken, isAdmin, updateUser)
router.delete('/:id', verifyToken, isAdmin, deleteUser)

export default router

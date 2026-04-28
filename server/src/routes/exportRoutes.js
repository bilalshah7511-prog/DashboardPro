import express from 'express'
import { exportUsersCSV, exportLoginRecordsCSV, exportUsersPDF, exportLoginRecordsPDF } from '../controllers/exportController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Protected routes
router.get('/users/csv', verifyToken, isAdmin, exportUsersCSV)
router.get('/users/pdf', verifyToken, isAdmin, exportUsersPDF)
router.get('/login-records/csv', verifyToken, exportLoginRecordsCSV)
router.get('/login-records/pdf', verifyToken, exportLoginRecordsPDF)

export default router

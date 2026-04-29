import express from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// All notification routes require authentication
router.get('/', verifyToken, getNotifications) // Get all notifications with unread count
router.get('/unread-count', verifyToken, getUnreadCount) // Get unread count only
router.put('/:id/read', verifyToken, markAsRead) // Mark single notification as read
router.put('/mark-all-read', verifyToken, markAllAsRead) // Mark all as read
router.delete('/:id', verifyToken, deleteNotification) // Delete notification

export default router

import pool from '../config/database.js'
import { io } from '../server.js'

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    const limit = req.query.limit || 20

    const result = await pool.query(
      `SELECT n.*, b.title as blog_title
       FROM notifications n
       LEFT JOIN blogs b ON n.blog_id = b.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit]
    )

    // Get unread count
    const unreadResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    )

    res.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadResult.rows[0].count)
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    )

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all as read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Helper function to create notification (used by other controllers)
export const createNotification = async (userId, type, title, message, blogId = null, commentId = null, senderName = null, senderImage = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, blog_id, comment_id, sender_name, sender_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, type, title, message, blogId, commentId, senderName, senderImage]
    )
    
    const notification = result.rows[0]
    
    // Emit socket event to user's room for real-time notification
    io.to(`user_${userId}`).emit('new_notification', {
      ...notification,
      is_read: false
    })
    
    console.log(`📧 Notification sent to user_${userId}: ${title}`)
    return true
  } catch (error) {
    console.error('Create notification error:', error)
    return false
  }
}

// Get unread count only
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    )

    res.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

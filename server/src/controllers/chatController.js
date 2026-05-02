import pool from '../config/database.js'

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id
    const { friendId } = req.body

    if (!friendId) {
      return res.status(400).json({ message: 'Friend ID is required' })
    }

    if (parseInt(friendId) === userId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' })
    }

    // Check if user is blocked
    const blockCheck = await pool.query(
      'SELECT * FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)',
      [userId, friendId]
    )

    if (blockCheck.rows.length > 0) {
      return res.status(403).json({ message: 'Cannot send friend request - user blocked' })
    }

    // Check if friend request already exists
    const existingRequest = await pool.query(
      'SELECT * FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    )

    if (existingRequest.rows.length > 0) {
      const existing = existingRequest.rows[0]
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'Already friends with this user' })
      } else if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already pending' })
      }
    }

    // Create friend request
    const result = await pool.query(
      `INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [userId, friendId]
    )

    // Get sender info for notification
    const senderResult = await pool.query(
      'SELECT name, profile_image FROM users WHERE id = $1',
      [userId]
    )
    const sender = senderResult.rows[0]

    // Create notification for receiver
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, sender_name, sender_image)
       VALUES ($1, 'friend_request', 'New Friend Request', $2, $3, $4, $5)`,
      [friendId, `${sender.name} sent you a friend request`, result.rows[0].id, sender.name, sender.profile_image]
    )

    res.status(201).json({ message: 'Friend request sent successfully', friendRequest: result.rows[0] })
  } catch (error) {
    console.error('Send friend request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id
    const { requestId } = req.params

    const result = await pool.query(
      `UPDATE friends SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING *`,
      [requestId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' })
    }

    const friendRequest = result.rows[0]

    // Get accepter info for notification
    const accepterResult = await pool.query(
      'SELECT name, profile_image FROM users WHERE id = $1',
      [userId]
    )
    const accepter = accepterResult.rows[0]

    // Create notification for sender that request was accepted
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, sender_name, sender_image)
       VALUES ($1, 'friend_accepted', 'Friend Request Accepted', $2, $3, $4, $5)`,
      [friendRequest.user_id, `${accepter.name} accepted your friend request`, friendRequest.id, accepter.name, accepter.profile_image]
    )

    res.json({ message: 'Friend request accepted', friend: friendRequest })
  } catch (error) {
    console.error('Accept friend request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id
    const { requestId } = req.params

    const result = await pool.query(
      `UPDATE friends SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING *`,
      [requestId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' })
    }

    res.json({ message: 'Friend request rejected' })
  } catch (error) {
    console.error('Reject friend request error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get all friends
export const getFriends = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(`
      SELECT f.id, f.status, f.created_at, f.updated_at,
             u.id as friend_id, u.name, u.email, u.profile_image, u.role
      FROM friends f
      JOIN users u ON (f.user_id = $1 AND f.friend_id = u.id) OR (f.friend_id = $1 AND f.user_id = u.id)
      WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
      ORDER BY f.updated_at DESC
    `, [userId])

    res.json({ friends: result.rows })
  } catch (error) {
    console.error('Get friends error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(`
      SELECT f.id, f.status, f.created_at,
             u.id as user_id, u.name, u.email, u.profile_image
      FROM friends f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `, [userId])

    res.json({ requests: result.rows })
  } catch (error) {
    console.error('Get pending requests error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id
    const { friendId } = req.params

    await pool.query(
      `DELETE FROM friends
       WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
       AND status = 'accepted'`,
      [userId, friendId]
    )

    res.json({ message: 'Friend removed successfully' })
  } catch (error) {
    console.error('Remove friend error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Block user
export const blockUser = async (req, res) => {
  try {
    const userId = req.user.id
    const { blockedId } = req.body

    if (!blockedId) {
      return res.status(400).json({ message: 'User ID to block is required' })
    }

    if (parseInt(blockedId) === userId) {
      return res.status(400).json({ message: 'Cannot block yourself' })
    }

    // Remove any existing friend relationship
    await pool.query(
      'DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, blockedId]
    )

    // Add to blocks
    await pool.query(
      'INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT (blocker_id, blocked_id) DO NOTHING',
      [userId, blockedId]
    )

    res.json({ message: 'User blocked successfully' })
  } catch (error) {
    console.error('Block user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const userId = req.user.id
    const { blockedId } = req.params

    await pool.query(
      'DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [userId, blockedId]
    )

    res.json({ message: 'User unblocked successfully' })
  } catch (error) {
    console.error('Unblock user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(`
      SELECT b.id, b.created_at, u.id as blocked_id, u.name, u.email, u.profile_image
      FROM blocks b
      JOIN users u ON b.blocked_id = u.id
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC
    `, [userId])

    res.json({ blockedUsers: result.rows })
  } catch (error) {
    console.error('Get blocked users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Send message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const { receiverId, content, imageUrl } = req.body

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' })
    }

    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'Message content or image is required' })
    }

    // Check if users are friends
    const friendCheck = await pool.query(
      `SELECT * FROM friends
       WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
       AND status = 'accepted'`,
      [senderId, receiverId]
    )

    if (friendCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Can only message friends' })
    }

    // Check if blocked
    const blockCheck = await pool.query(
      'SELECT * FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)',
      [senderId, receiverId]
    )

    if (blockCheck.rows.length > 0) {
      return res.status(403).json({ message: 'Cannot send message - user blocked' })
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [senderId, receiverId, content || null, imageUrl || null]
    )

    const messageData = result.rows[0]

    // Get sender info for socket emit
    const senderResult = await pool.query(
      'SELECT name, profile_image FROM users WHERE id = $1',
      [senderId]
    )
    const senderInfo = senderResult.rows[0] || {}

    // Emit socket event to both sender and receiver for real-time updates
    const io = req.app.get('io')
    console.log('📤 Backend - io instance:', io ? 'Available' : 'NOT AVAILABLE')
    if (io) {
      console.log('📤 Backend emitting new_message to sender:', senderId, 'and receiver:', receiverId)
      const socketData = {
        ...messageData,
        sender_name: senderInfo.name,
        sender_image: senderInfo.profile_image
      }
      console.log('📤 Backend - socketData:', socketData)
      console.log('📤 Backend - Emitting to room: user_' + receiverId)
      io.to(`user_${receiverId}`).emit('new_message', socketData)
      console.log('📤 Backend - Emitting to room: user_' + senderId)
      io.to(`user_${senderId}`).emit('new_message', socketData)
      console.log('📤 Backend - Emits completed')
    } else {
      console.error('❌ Backend - io instance not available! Socket emit skipped.')
    }

    res.status(201).json({ message: 'Message sent', data: messageData })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get conversation with a friend
export const getConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { friendId } = req.params

    // Check if users are friends
    const friendCheck = await pool.query(
      `SELECT * FROM friends
       WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
       AND status = 'accepted'`,
      [userId, friendId]
    )

    if (friendCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Can only view conversations with friends' })
    }

    const result = await pool.query(`
      SELECT m.*,
             s.name as sender_name, s.profile_image as sender_image,
             r.name as receiver_name, r.profile_image as receiver_image
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE ((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))
        AND m.is_deleted = false
      ORDER BY m.created_at ASC
    `, [userId, friendId])

    // Mark messages as delivered (where user is receiver and not yet delivered)
    await pool.query(
      `UPDATE messages SET delivered_at = CURRENT_TIMESTAMP
       WHERE receiver_id = $1 AND sender_id = $2 AND delivered_at IS NULL`,
      [userId, friendId]
    )

    // Mark messages as read
    await pool.query(
      `UPDATE messages SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
      [userId, friendId]
    )

    res.json({ messages: result.rows })
  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get recent conversations list
export const getRecentConversations = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(`
      SELECT DISTINCT ON (other_user_id)
        other_user_id,
        last_message,
        last_message_time,
        unread_count,
        u.name as other_user_name,
        u.profile_image as other_user_image
      FROM (
        SELECT
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as other_user_id,
          content as last_message,
          created_at as last_message_time,
          CASE WHEN receiver_id = $1 AND is_read = false THEN 1 ELSE 0 END as unread_count
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      ) m
      JOIN users u ON m.other_user_id = u.id
      ORDER BY other_user_id, last_message_time DESC
    `, [userId])

    res.json({ conversations: result.rows })
  } catch (error) {
    console.error('Get recent conversations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete message (soft delete for sender only)
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const { messageId } = req.params

    const result = await pool.query(
      `UPDATE messages SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND sender_id = $2 AND is_deleted = false
       RETURNING *`,
      [messageId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found or not authorized' })
    }

    res.json({ message: 'Message deleted successfully', deletedMessage: result.rows[0] })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete message for everyone
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const userId = req.user.id
    const { messageId } = req.params

    // Check if user is the sender and message is less than 1 hour old
    const messageCheck = await pool.query(
      `SELECT * FROM messages WHERE id = $1 AND sender_id = $2`,
      [messageId, userId]
    )

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found or not authorized' })
    }

    const message = messageCheck.rows[0]
    const messageAge = Date.now() - new Date(message.created_at).getTime()
    const oneHour = 60 * 60 * 1000

    if (messageAge > oneHour) {
      return res.status(403).json({ message: 'Can only delete messages within 1 hour' })
    }

    // Permanently delete the message
    await pool.query('DELETE FROM messages WHERE id = $1', [messageId])

    res.json({ message: 'Message deleted for everyone' })
  } catch (error) {
    console.error('Delete message for everyone error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get message info (read receipts, delivery status)
export const getMessageInfo = async (req, res) => {
  try {
    const userId = req.user.id
    const { messageId } = req.params

    const result = await pool.query(
      `SELECT m.*, u.name as receiver_name, u.profile_image as receiver_image
       FROM messages m
       JOIN users u ON m.receiver_id = u.id
       WHERE m.id = $1 AND m.sender_id = $2`,
      [messageId, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' })
    }

    const message = result.rows[0]
    res.json({
      messageInfo: {
        sent_at: message.created_at,
        delivered_at: message.delivered_at,
        read_at: message.read_at,
        is_read: message.is_read,
        receiver_name: message.receiver_name,
        receiver_image: message.receiver_image
      }
    })
  } catch (error) {
    console.error('Get message info error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Follow user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id
    const { followingId } = req.body

    if (!followingId) {
      return res.status(400).json({ message: 'User ID to follow is required' })
    }

    if (parseInt(followingId) === followerId) {
      return res.status(400).json({ message: 'Cannot follow yourself' })
    }

    await pool.query(
      'INSERT INTO following (follower_id, following_id) VALUES ($1, $2) ON CONFLICT (follower_id, following_id) DO NOTHING',
      [followerId, followingId]
    )

    res.json({ message: 'User followed successfully' })
  } catch (error) {
    console.error('Follow user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id
    const { followingId } = req.params

    await pool.query(
      'DELETE FROM following WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    )

    res.json({ message: 'User unfollowed successfully' })
  } catch (error) {
    console.error('Unfollow user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params

    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.profile_image, f.created_at
      FROM following f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
    `, [userId])

    res.json({ followers: result.rows })
  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params

    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.profile_image, f.created_at
      FROM following f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `, [userId])

    res.json({ following: result.rows })
  } catch (error) {
    console.error('Get following error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user friend stats (for profile)
export const getUserFriendStats = async (req, res) => {
  try {
    const { userId } = req.params

    const friendsResult = await pool.query(
      `SELECT COUNT(*) FROM friends WHERE (user_id = $1 OR friend_id = $1) AND status = 'accepted'`,
      [userId]
    )

    const followersResult = await pool.query(
      'SELECT COUNT(*) FROM following WHERE following_id = $1',
      [userId]
    )

    const followingResult = await pool.query(
      'SELECT COUNT(*) FROM following WHERE follower_id = $1',
      [userId]
    )

    res.json({
      friendsCount: parseInt(friendsResult.rows[0].count),
      followersCount: parseInt(followersResult.rows[0].count),
      followingCount: parseInt(followingResult.rows[0].count)
    })
  } catch (error) {
    console.error('Get user friend stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ADMIN ENDPOINTS

// Get all messages (Admin only)
export const getAllMessages = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*,
             s.name as sender_name, s.email as sender_email,
             r.name as receiver_name, r.email as receiver_email
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      ORDER BY m.created_at DESC
      LIMIT 1000
    `)

    res.json({ messages: result.rows })
  } catch (error) {
    console.error('Get all messages error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get conversation between two users (Admin only)
export const getAdminConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params

    const result = await pool.query(`
      SELECT m.*,
             s.name as sender_name, s.profile_image as sender_image,
             r.name as receiver_name, r.profile_image as receiver_image
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [userId1, userId2])

    res.json({ messages: result.rows })
  } catch (error) {
    console.error('Get admin conversation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get all user conversations list for admin
export const getAllUserConversations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT
        LEAST(sender_id, receiver_id) as user1_id,
        GREATEST(sender_id, receiver_id) as user2_id,
        u1.name as user1_name,
        u2.name as user2_name,
        COUNT(*) as message_count,
        MAX(m.created_at) as last_message_at
      FROM messages m
      JOIN users u1 ON LEAST(sender_id, receiver_id) = u1.id
      JOIN users u2 ON GREATEST(sender_id, receiver_id) = u2.id
      GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), u1.name, u2.name
      ORDER BY last_message_at DESC
    `)

    res.json({ conversations: result.rows })
  } catch (error) {
    console.error('Get all user conversations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false',
      [userId]
    )

    res.json({ unreadCount: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Mark all messages from a sender as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    const { senderId } = req.body

    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' })
    }

    // Mark all messages from sender to current user as read
    const result = await pool.query(
      `UPDATE messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
       RETURNING *`,
      [senderId, userId]
    )

    res.json({ 
      message: 'Messages marked as read', 
      markedCount: result.rowCount,
      messages: result.rows 
    })
  } catch (error) {
    console.error('Mark messages as read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

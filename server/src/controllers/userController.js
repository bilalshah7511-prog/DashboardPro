import bcrypt from 'bcryptjs'
import pool from '../config/database.js'

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.gender, u.profile_image,
             u.two_factor_enabled, u.email_verified, u.created_at, u.updated_at,
             CAST(COUNT(lr.id) AS INTEGER) as login_count,
             MAX(lr.login_time) as last_login
      FROM users u
      LEFT JOIN login_records lr ON u.id = lr.user_id
      GROUP BY u.id, u.name, u.email, u.role, u.gender, u.profile_image,
               u.two_factor_enabled, u.email_verified, u.created_at, u.updated_at
      ORDER BY u.created_at DESC
    `)

    res.json({ users: result.rows })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get available users for adding friends (any authenticated user)
export const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.user.id

    // Get all users except current user
    const result = await pool.query(`
      SELECT u.id, u.name, u.profile_image, u.gender, u.created_at
      FROM users u
      WHERE u.id != $1
      ORDER BY u.name ASC
    `, [userId])

    // Get existing friends and pending requests
    const friendsResult = await pool.query(`
      SELECT friend_id as id FROM friends WHERE user_id = $1
      UNION
      SELECT user_id as id FROM friends WHERE friend_id = $1
    `, [userId])

    // Get blocked users
    const blockedResult = await pool.query(`
      SELECT blocked_id as id FROM blocks WHERE blocker_id = $1
      UNION
      SELECT blocker_id as id FROM blocks WHERE blocked_id = $1
    `, [userId])

    const friendIds = new Set(friendsResult.rows.map(r => r.id))
    const blockedIds = new Set(blockedResult.rows.map(r => r.id))

    // Filter out friends and blocked users
    const availableUsers = result.rows.filter(u =>
      !friendIds.has(u.id) && !blockedIds.has(u.id)
    )

    res.json({ users: availableUsers })
  } catch (error) {
    console.error('Get available users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(`
      SELECT id, name, email, role, gender, profile_image,
             two_factor_enabled, email_verified, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, gender, profileImage, currentPassword, newPassword } = req.body

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required' })
      }

      const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId])
      const user = result.rows[0]

      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId])
    }

    // Update profile fields
    const updates = []
    const values = []
    let paramCount = 1

    if (name) {
      updates.push(`name = $${paramCount}`)
      values.push(name)
      paramCount++
    }

    if (gender) {
      updates.push(`gender = $${paramCount}`)
      values.push(gender)
      paramCount++
    }

    if (profileImage !== undefined) {
      updates.push(`profile_image = $${paramCount}`)
      values.push(profileImage)
      paramCount++
    }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`)
      values.push(userId)

      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, name, email, role, gender, profile_image, two_factor_enabled, email_verified
      `

      const result = await pool.query(query, values)
      res.json({ message: 'Profile updated successfully', user: result.rows[0] })
    } else {
      res.json({ message: 'No changes made' })
    }
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update user (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, gender, password } = req.body

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [email, id]
      )
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists' })
      }
    }

    const updates = []
    const values = []
    let paramCount = 1

    if (name) {
      updates.push(`name = $${paramCount}`)
      values.push(name)
      paramCount++
    }

    if (email) {
      updates.push(`email = $${paramCount}`)
      values.push(email)
      paramCount++
    }

    if (role) {
      updates.push(`role = $${paramCount}`)
      values.push(role)
      paramCount++
    }

    if (gender) {
      updates.push(`gender = $${paramCount}`)
      values.push(gender)
      paramCount++
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updates.push(`password = $${paramCount}`)
      values.push(hashedPassword)
      paramCount++
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, gender, profile_image, two_factor_enabled, email_verified
    `

    const result = await pool.query(query, values)
    res.json({ message: 'User updated successfully', user: result.rows[0] })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get login records
export const getLoginRecords = async (req, res) => {
  try {
    let query = `
      SELECT lr.*, u.name, u.email
      FROM login_records lr
      JOIN users u ON lr.user_id = u.id
    `

    // If not admin, only show own records
    if (req.user.role !== 'admin') {
      query += ' WHERE lr.user_id = $1'
    }

    query += ' ORDER BY lr.login_time DESC LIMIT 100'

    const result = req.user.role === 'admin'
      ? await pool.query(query)
      : await pool.query(query, [req.user.id])

    res.json({ loginRecords: result.rows })
  } catch (error) {
    console.error('Get login records error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user blog statistics (for hover card)
export const getUserBlogStats = async (req, res) => {
  try {
    const { id } = req.params

    // Get published blogs count (approved status)
    const publishedResult = await pool.query(
      `SELECT COUNT(*) FROM blogs WHERE user_id = $1 AND status = 'approved'`,
      [id]
    )
    const publishedCount = parseInt(publishedResult.rows[0].count)

    // Get rejected blogs count
    const rejectedResult = await pool.query(
      `SELECT COUNT(*) FROM blogs WHERE user_id = $1 AND status = 'rejected'`,
      [id]
    )
    const rejectedCount = parseInt(rejectedResult.rows[0].count)

    // Get pending blogs count
    const pendingResult = await pool.query(
      `SELECT COUNT(*) FROM blogs WHERE user_id = $1 AND status = 'pending'`,
      [id]
    )
    const pendingCount = parseInt(pendingResult.rows[0].count)

    // Get total likes on user's blogs
    const likesResult = await pool.query(
      `SELECT COUNT(*) FROM blog_likes bl
       JOIN blogs b ON bl.blog_id = b.id
       WHERE b.user_id = $1`,
      [id]
    )
    const totalLikes = parseInt(likesResult.rows[0].count)

    // Get total views on user's blogs
    const viewsResult = await pool.query(
      `SELECT COALESCE(SUM(view_count), 0) as total_views FROM blogs WHERE user_id = $1`,
      [id]
    )
    const totalViews = parseInt(viewsResult.rows[0].total_views)

    // Get total comments on user's blogs
    const commentsResult = await pool.query(
      `SELECT COUNT(*) FROM blog_comments c
       JOIN blogs b ON c.blog_id = b.id
       WHERE b.user_id = $1`,
      [id]
    )
    const totalComments = parseInt(commentsResult.rows[0].count)

    // Get user basic info
    const userResult = await pool.query(
      `SELECT name, email, profile_image, role, created_at FROM users WHERE id = $1`,
      [id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get friend stats
    const friendsResult = await pool.query(
      `SELECT COUNT(*) FROM friends WHERE (user_id = $1 OR friend_id = $1) AND status = 'accepted'`,
      [id]
    )

    const followersResult = await pool.query(
      'SELECT COUNT(*) FROM following WHERE following_id = $1',
      [id]
    )

    const followingResult = await pool.query(
      'SELECT COUNT(*) FROM following WHERE follower_id = $1',
      [id]
    )

    res.json({
      user: userResult.rows[0],
      stats: {
        publishedCount,
        rejectedCount,
        pendingCount,
        totalLikes,
        totalViews,
        totalComments
      },
      friendStats: {
        friendsCount: parseInt(friendsResult.rows[0].count),
        followersCount: parseInt(followersResult.rows[0].count),
        followingCount: parseInt(followingResult.rows[0].count)
      }
    })
  } catch (error) {
    console.error('Get user blog stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id

    // Total users (admin only)
    let totalUsers = 0
    if (req.user.role === 'admin') {
      const usersResult = await pool.query('SELECT COUNT(*) FROM users')
      totalUsers = parseInt(usersResult.rows[0].count)
    }

    // Total logins
    const loginsQuery = userId
      ? 'SELECT COUNT(*) FROM login_records WHERE user_id = $1'
      : 'SELECT COUNT(*) FROM login_records'

    const loginsResult = userId
      ? await pool.query(loginsQuery, [userId])
      : await pool.query(loginsQuery)

    const totalLogins = parseInt(loginsResult.rows[0].count)

    // Today's active users (admin only) or today's logins (user)
    let activeToday = 0
    if (req.user.role === 'admin') {
      const activeTodayResult = await pool.query(
        'SELECT COUNT(DISTINCT user_id) FROM login_records WHERE DATE(login_time) = CURRENT_DATE'
      )
      activeToday = parseInt(activeTodayResult.rows[0].count)
    }

    // Last login (for regular users)
    let lastLogin = null
    if (userId) {
      const lastLoginResult = await pool.query(
        'SELECT MAX(login_time) as last_login FROM login_records WHERE user_id = $1',
        [userId]
      )
      lastLogin = lastLoginResult.rows[0].last_login
    }

    res.json({
      totalUsers,
      totalLogins,
      activeToday,
      userLogins: totalLogins, // For regular users
      lastLogin
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

import pool from '../config/database.js'
import { createNotification } from './notificationController.js'

// Create a new blog
export const createBlog = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, description, featuredImage, tags } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' })
    }

    const result = await pool.query(
      `INSERT INTO blogs (user_id, title, description, featured_image, tags, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, title, description, featuredImage || null, tags || []]
    )

    res.status(201).json({
      message: 'Blog created successfully and sent for approval',
      blog: result.rows[0]
    })
  } catch (error) {
    console.error('Create blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get all blogs (for users - only approved blogs)
export const getAllBlogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, b.user_id, b.title, b.description, b.featured_image, b.tags,
        b.status, b.published_at, b.created_at, b.updated_at, b.view_count,
        u.name as author_name, 
        u.profile_image as author_image,
        COALESCE(l.likes_count, 0) as likes_count,
        COALESCE(c.comments_count, 0) as comments_count,
        COALESCE(b.view_count, 0) as views
      FROM blogs b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as likes_count 
        FROM blog_likes 
        GROUP BY blog_id
      ) l ON b.id = l.blog_id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as comments_count 
        FROM blog_comments 
        GROUP BY blog_id
      ) c ON b.id = c.blog_id
      WHERE b.status = 'approved'
      ORDER BY b.published_at DESC, b.created_at DESC
    `)

    res.json({ blogs: result.rows })
  } catch (error) {
    console.error('Get all blogs error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get user's own blogs
export const getMyBlogs = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(`
      SELECT 
        b.id, b.user_id, b.title, b.description, b.featured_image, b.tags,
        b.status, b.published_at, b.created_at, b.updated_at, b.view_count,
        u.name as author_name, 
        u.profile_image as author_image,
        COALESCE(l.likes_count, 0) as likes_count,
        COALESCE(c.comments_count, 0) as comments_count,
        COALESCE(b.view_count, 0) as views
      FROM blogs b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as likes_count 
        FROM blog_likes 
        GROUP BY blog_id
      ) l ON b.id = l.blog_id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as comments_count 
        FROM blog_comments 
        GROUP BY blog_id
      ) c ON b.id = c.blog_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId])

    res.json({ blogs: result.rows })
  } catch (error) {
    console.error('Get my blogs error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all blogs for admin (including pending)
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const { status } = req.query

    let query = `
      SELECT 
        b.id, b.user_id, b.title, b.description, b.featured_image, b.tags,
        b.status, b.published_at, b.created_at, b.updated_at, b.view_count,
        u.name as author_name, u.email as author_email, u.profile_image as author_image,
        COALESCE(l.likes_count, 0) as likes_count,
        COALESCE(c.comments_count, 0) as comments_count
      FROM blogs b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as likes_count 
        FROM blog_likes 
        GROUP BY blog_id
      ) l ON b.id = l.blog_id
      LEFT JOIN (
        SELECT blog_id, COUNT(*) as comments_count 
        FROM blog_comments 
        GROUP BY blog_id
      ) c ON b.id = c.blog_id
    `

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ` WHERE b.status = '${status}'`
    }

    query += ' ORDER BY b.created_at DESC'

    const result = await pool.query(query)

    res.json({ blogs: result.rows })
  } catch (error) {
    console.error('Get all blogs admin error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(`
      SELECT b.*, u.name as author_name, u.email as author_email, u.profile_image as author_image
      FROM blogs b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    res.json({ blog: result.rows[0] })
  } catch (error) {
    console.error('Get blog by ID error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update blog (only by owner)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { title, description, featuredImage, tags } = req.body

    // Check if blog exists and belongs to user
    const blogCheck = await pool.query('SELECT * FROM blogs WHERE id = $1', [id])

    if (blogCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    if (blogCheck.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this blog' })
    }

    const updates = []
    const values = []
    let paramCount = 1

    if (title) {
      updates.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }

    if (description) {
      updates.push(`description = $${paramCount}`)
      values.push(description)
      paramCount++
    }

    if (featuredImage !== undefined) {
      updates.push(`featured_image = $${paramCount}`)
      values.push(featuredImage)
      paramCount++
    }

    if (tags) {
      updates.push(`tags = $${paramCount}`)
      values.push(tags)
      paramCount++
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    updates.push(`status = 'pending'`) // Reset to pending after edit
    values.push(id)

    const query = `
      UPDATE blogs
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await pool.query(query, values)

    res.json({
      message: 'Blog updated successfully and sent for approval',
      blog: result.rows[0]
    })
  } catch (error) {
    console.error('Update blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Approve blog (admin only)
export const approveBlog = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE blogs
       SET status = 'approved', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    const blog = result.rows[0]

    // Notify blog owner
    await createNotification(
      blog.user_id,
      'blog_approved',
      'Blog Approved',
      `Your blog "${blog.title}" has been approved and published!`,
      blog.id,
      null,
      'Notice',
      '/notice.png'
    )

    res.json({
      message: 'Blog approved successfully',
      blog
    })
  } catch (error) {
    console.error('Approve blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Reject blog (admin only)
export const rejectBlog = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE blogs
       SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    const blog = result.rows[0]

    // Notify blog owner
    await createNotification(
      blog.user_id,
      'blog_rejected',
      'Blog Rejected',
      `Your blog "${blog.title}" has been rejected. Please review and resubmit.`,
      blog.id,
      null,
      'Notice',
      '/notice.png'
    )

    res.json({
      message: 'Blog rejected',
      blog
    })
  } catch (error) {
    console.error('Reject blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Check if blog exists
    const blogCheck = await pool.query('SELECT * FROM blogs WHERE id = $1', [id])

    if (blogCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    // Only owner or admin can delete
    if (blogCheck.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' })
    }

    await pool.query('DELETE FROM blogs WHERE id = $1', [id])

    res.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Delete blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Like blog
export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Check if already liked
    const existingLike = await pool.query(
      'SELECT * FROM blog_likes WHERE blog_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (existingLike.rows.length > 0) {
      return res.status(400).json({ message: 'Blog already liked' })
    }

    // Get blog info for notification
    const blogResult = await pool.query(
      'SELECT user_id, title FROM blogs WHERE id = $1',
      [id]
    )
    const blog = blogResult.rows[0]

    await pool.query(
      'INSERT INTO blog_likes (blog_id, user_id) VALUES ($1, $2)',
      [id, userId]
    )

    // Notify blog owner (if not liking own blog)
    if (blog && blog.user_id !== userId) {
      const likerResult = await pool.query('SELECT name, profile_image FROM users WHERE id = $1', [userId])
      const liker = likerResult.rows[0]
      const likerName = liker?.name || 'Someone'
      const likerImage = liker?.profile_image || null
      await createNotification(
        blog.user_id,
        'like',
        'New Like',
        `${likerName} liked your blog "${blog.title}"`,
        id,
        null,
        likerName,
        likerImage
      )
    }

    res.json({ message: 'Blog liked successfully' })
  } catch (error) {
    console.error('Like blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Unlike blog
export const unlikeBlog = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    await pool.query(
      'DELETE FROM blog_likes WHERE blog_id = $1 AND user_id = $2',
      [id, userId]
    )

    res.json({ message: 'Blog unliked successfully' })
  } catch (error) {
    console.error('Unlike blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get blog likes count and user like status
export const getBlogLikes = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    // Get total likes count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = $1',
      [id]
    )

    // Check if current user liked
    let userLiked = false
    if (userId) {
      const userLikeResult = await pool.query(
        'SELECT * FROM blog_likes WHERE blog_id = $1 AND user_id = $2',
        [id, userId]
      )
      userLiked = userLikeResult.rows.length > 0
    }

    res.json({
      count: parseInt(countResult.rows[0].count),
      userLiked
    })
  } catch (error) {
    console.error('Get blog likes error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Add comment (with optional parent_id for replies)
export const addComment = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { content, parentId } = req.body

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' })
    }

    // If parentId is provided, verify it exists and belongs to the same blog
    if (parentId) {
      const parentCheck = await pool.query(
        'SELECT * FROM blog_comments WHERE id = $1 AND blog_id = $2',
        [parentId, id]
      )
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Parent comment not found' })
      }
    }

    const result = await pool.query(
      `INSERT INTO blog_comments (blog_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, userId, content.trim(), parentId || null]
    )

    // Get user info
    const userResult = await pool.query(
      'SELECT name, profile_image FROM users WHERE id = $1',
      [userId]
    )

    // Get parent comment info for notification
    let parentComment = null
    if (parentId) {
      const parentResult = await pool.query(
        'SELECT user_id FROM blog_comments WHERE id = $1',
        [parentId]
      )
      parentComment = parentResult.rows[0]
    }

    const comment = {
      ...result.rows[0],
      author_name: userResult.rows[0]?.name,
      author_image: userResult.rows[0]?.profile_image
    }

    // Get blog info for notifications
    const blogResult = await pool.query(
      'SELECT user_id, title FROM blogs WHERE id = $1',
      [id]
    )
    const blog = blogResult.rows[0]
    const commenterName = userResult.rows[0]?.name || 'Someone'

    // Notify blog owner about new comment (if not commenting on own blog)
    if (blog && blog.user_id !== userId) {
      await createNotification(
        blog.user_id,
        'comment',
        'New Comment',
        `${commenterName} commented on your blog "${blog.title}"`,
        id,
        comment.id,
        commenterName,
        comment.author_image
      )
    }

    // If it's a reply, notify parent comment owner (if different from commenter and blog owner)
    if (parentComment && parentComment.user_id !== userId && parentComment.user_id !== blog?.user_id) {
      await createNotification(
        parentComment.user_id,
        'reply',
        'New Reply',
        `${commenterName} replied to your comment on "${blog.title}"`,
        id,
        comment.id,
        commenterName,
        comment.author_image
      )
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment,
      replyToUserId: parentComment?.user_id
    })
  } catch (error) {
    console.error('Add comment error:', error.message, error.stack)
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      detail: error.detail || 'Unknown database error'
    })
  }
}

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params
    const userId = req.user.id

    // Check if comment exists and belongs to user
    const commentCheck = await pool.query(
      'SELECT * FROM blog_comments WHERE id = $1 AND blog_id = $2',
      [commentId, id]
    )

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    if (commentCheck.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    await pool.query('DELETE FROM blog_comments WHERE id = $1', [commentId])

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get blog comments
export const getBlogComments = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT bc.*, u.name as author_name, u.profile_image as author_image,
              pu.name as parent_author
       FROM blog_comments bc
       JOIN users u ON bc.user_id = u.id
       LEFT JOIN blog_comments pc ON bc.parent_id = pc.id
       LEFT JOIN users pu ON pc.user_id = pu.id
       WHERE bc.blog_id = $1
       ORDER BY bc.created_at DESC`,
      [id]
    )

    res.json({ comments: result.rows })
  } catch (error) {
    console.error('Get blog comments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Track blog view
export const trackBlogView = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    // Get IP from x-forwarded-for header (for proxy) or req.ip
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                      req.headers['x-real-ip'] || 
                      req.ip || 
                      'unknown'
    const userAgent = req.headers['user-agent']

    // Check if view already exists (to prevent duplicate views)
    let existingView
    if (userId) {
      existingView = await pool.query(
        'SELECT * FROM blog_views WHERE blog_id = $1 AND user_id = $2',
        [id, userId]
      )
    } else {
      existingView = await pool.query(
        'SELECT * FROM blog_views WHERE blog_id = $1 AND ip_address = $2 AND user_id IS NULL',
        [id, ipAddress]
      )
    }

    // If no existing view, record it and increment count
    if (existingView.rows.length === 0) {
      await pool.query(
        'INSERT INTO blog_views (blog_id, user_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
        [id, userId || null, ipAddress, userAgent]
      )

      // Increment blog view count
      await pool.query(
        'UPDATE blogs SET view_count = view_count + 1 WHERE id = $1',
        [id]
      )
    }

    // Get updated view count
    const countResult = await pool.query(
      'SELECT view_count FROM blogs WHERE id = $1',
      [id]
    )

    res.json({ viewCount: countResult.rows[0]?.view_count || 0 })
  } catch (error) {
    console.error('Track blog view error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Unpublish blog (admin only)
export const unpublishBlog = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE blogs
       SET status = 'unpublished', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' })
    }

    res.json({
      message: 'Blog unpublished successfully',
      blog: result.rows[0]
    })
  } catch (error) {
    console.error('Unpublish blog error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get latest blogs for public display
export const getLatestBlogs = async (req, res) => {
  try {
    const limit = req.query.limit || 6

    const result = await pool.query(
      `SELECT b.*, u.name as author_name, u.profile_image as author_image,
        (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as likes_count,
        (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comments_count
       FROM blogs b
       JOIN users u ON b.user_id = u.id
       WHERE b.status = 'approved'
       ORDER BY b.published_at DESC
       LIMIT $1`,
      [limit]
    )

    res.json({ blogs: result.rows })
  } catch (error) {
    console.error('Get latest blogs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

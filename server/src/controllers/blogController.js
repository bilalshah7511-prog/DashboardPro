import pool from '../config/database.js'

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
      SELECT b.*, u.name as author_name, u.profile_image as author_image
      FROM blogs b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'approved'
      ORDER BY b.published_at DESC, b.created_at DESC
    `)

    res.json({ blogs: result.rows })
  } catch (error) {
    console.error('Get all blogs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user's own blogs
export const getMyBlogs = async (req, res) => {
  try {
    const userId = req.user.id

    const result = await pool.query(`
      SELECT b.*, u.name as author_name, u.profile_image as author_image
      FROM blogs b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId])

    res.json({ blogs: result.rows })
  } catch (error) {
    console.error('Get my blogs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get all blogs for admin (including pending)
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const { status } = req.query

    let query = `
      SELECT b.*, u.name as author_name, u.email as author_email, u.profile_image as author_image
      FROM blogs b
      JOIN users u ON b.user_id = u.id
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

    res.json({
      message: 'Blog approved successfully',
      blog: result.rows[0]
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

    res.json({
      message: 'Blog rejected',
      blog: result.rows[0]
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

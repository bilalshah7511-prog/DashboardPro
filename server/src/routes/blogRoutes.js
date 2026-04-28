import express from 'express'
import {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getAllBlogsAdmin,
  getBlogById,
  updateBlog,
  approveBlog,
  rejectBlog,
  deleteBlog
} from '../controllers/blogController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public/User routes
router.get('/all', verifyToken, getAllBlogs) // Get all approved blogs
router.get('/my-blogs', verifyToken, getMyBlogs) // Get user's own blogs
router.get('/:id', verifyToken, getBlogById) // Get single blog
router.post('/', verifyToken, createBlog) // Create blog
router.put('/:id', verifyToken, updateBlog) // Update blog
router.delete('/:id', verifyToken, deleteBlog) // Delete blog

// Admin only routes
router.get('/admin/all', verifyToken, isAdmin, getAllBlogsAdmin) // Get all blogs (including pending)
router.put('/:id/approve', verifyToken, isAdmin, approveBlog) // Approve blog
router.put('/:id/reject', verifyToken, isAdmin, rejectBlog) // Reject blog

export default router

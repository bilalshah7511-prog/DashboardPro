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
  deleteBlog,
  likeBlog,
  unlikeBlog,
  getBlogLikes,
  addComment,
  deleteComment,
  getBlogComments,
  trackBlogView,
  unpublishBlog,
  getLatestBlogs
} from '../controllers/blogController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public routes (no auth required)
router.get('/latest', getLatestBlogs) // Get latest approved blogs for public display

// Public/User routes (auth required)
router.get('/all', verifyToken, getAllBlogs) // Get all approved blogs
router.get('/my-blogs', verifyToken, getMyBlogs) // Get user's own blogs
router.get('/:id', verifyToken, getBlogById) // Get single blog
router.get('/:id/likes', verifyToken, getBlogLikes) // Get blog likes count
router.get('/:id/comments', verifyToken, getBlogComments) // Get blog comments
router.post('/', verifyToken, createBlog) // Create blog
router.put('/:id', verifyToken, updateBlog) // Update blog
router.delete('/:id', verifyToken, deleteBlog) // Delete blog
router.post('/:id/like', verifyToken, likeBlog) // Like blog
router.delete('/:id/like', verifyToken, unlikeBlog) // Unlike blog
router.post('/:id/comments', verifyToken, addComment) // Add comment
router.delete('/:id/comments/:commentId', verifyToken, deleteComment) // Delete comment
router.post('/:id/view', verifyToken, trackBlogView) // Track blog view

// Admin only routes
router.get('/admin/all', verifyToken, isAdmin, getAllBlogsAdmin) // Get all blogs (including pending)
router.put('/:id/approve', verifyToken, isAdmin, approveBlog) // Approve blog
router.put('/:id/reject', verifyToken, isAdmin, rejectBlog) // Reject blog
router.put('/:id/unpublish', verifyToken, isAdmin, unpublishBlog) // Unpublish approved blog

export default router

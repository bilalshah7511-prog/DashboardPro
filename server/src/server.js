import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import pool from './config/database.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import twoFactorRoutes from './routes/twoFactorRoutes.js'
import exportRoutes from './routes/exportRoutes.js'
import blogRoutes from './routes/blogRoutes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: '*',
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
})

app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/2fa', twoFactorRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/blogs', blogRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id)

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  // Broadcast new user registration
  socket.on('user_registered', (data) => {
    io.emit('new_user', data)
  })

  // Broadcast user login
  socket.on('user_logged_in', (data) => {
    io.emit('user_activity', {
      type: 'login',
      user: data.user,
      timestamp: new Date()
    })
  })

  // Broadcast user logout
  socket.on('user_logged_out', (data) => {
    io.emit('user_activity', {
      type: 'logout',
      user: data.user,
      timestamp: new Date()
    })
  })

  // Broadcast profile update
  socket.on('profile_updated', (data) => {
    io.to(`user_${data.userId}`).emit('profile_changed', data)
  })

  // Broadcast user role change (admin action)
  socket.on('user_role_changed', (data) => {
    io.to(`user_${data.userId}`).emit('role_updated', data)
    io.emit('user_list_updated')
  })

  // Broadcast user deletion (admin action)
  socket.on('user_deleted', (data) => {
    io.emit('user_list_updated')
  })

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id)
  })
})

// Make io accessible to routes
app.set('io', io)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server
const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log('🚀 Server started successfully!')
  console.log(`📡 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`⚡ WebSocket enabled`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(async () => {
    console.log('HTTP server closed')
    await pool.end()
    console.log('Database connection closed')
    process.exit(0)
  })
})

export { io }

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
import notificationRoutes from './routes/notificationRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Trust proxy for Railway deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://blogpanel-web.vercel.app',
  'https://blogpanel-web.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean)

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Make io accessible to controllers
app.set('io', io)

// Middleware
app.use(helmet())
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' 
    ? (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100)
    : 1000, // Much higher limit for development
  message: 'Too many requests from this IP, please try again later.'
})

app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/2fa', twoFactorRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id)

  // Track userId for this socket connection
  let connectedUserId = null

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`)
    connectedUserId = userId
    console.log(`✅ User ${userId} joined room user_${userId}. Socket ID: ${socket.id}`)
    console.log(`📋 Current socket rooms:`, Array.from(socket.rooms))
    // Broadcast online status to all users (they can filter by their friends)
    io.emit('user_online', { userId })
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

  // Chat events
  socket.on('send_message', (data) => {
    console.log('📨 Server received send_message:', data)
    const receiverId = data.receiver_id || data.receiverId
    const senderId = data.sender_id || data.senderId

    // Emit to receiver's room
    console.log(`📨 Emitting to user_${receiverId}`)
    io.to(`user_${receiverId}`).emit('new_message', data)

    // Also emit to sender's room for sync across devices
    console.log(`📨 Emitting to user_${senderId}`)
    io.to(`user_${senderId}`).emit('new_message', data)
  })

  socket.on('friend_request_sent', (data) => {
    io.to(`user_${data.receiverId}`).emit('new_friend_request', data)
  })

  socket.on('friend_request_accepted', (data) => {
    console.log('🎉 Server received friend_request_accepted:', data)
    // Notify the user who sent the original request (requester)
    if (data.requesterId) {
      console.log(`🎉 Emitting to requester user_${data.requesterId}`)
      io.to(`user_${data.requesterId}`).emit('friend_request_accepted', {
        ...data,
        receiverName: data.accepterName // For backward compatibility
      })
    }
    // Also notify the user who accepted (accepter)
    if (data.accepterId) {
      console.log(`🎉 Emitting to accepter user_${data.accepterId}`)
      io.to(`user_${data.accepterId}`).emit('friend_request_accepted', data)
    }
  })

  socket.on('typing', (data) => {
    io.to(`user_${data.receiverId}`).emit('typing', {
      senderId: data.senderId,
      isTyping: data.isTyping
    })
  })

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id)
    // Broadcast offline status if user was connected
    if (connectedUserId) {
      io.emit('user_offline', { 
        userId: connectedUserId,
        lastActive: new Date().toISOString()
      })
    }
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

import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id)
    })

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit('join', userId)
    }
  }

  // Emit events
  emitUserRegistered(user) {
    if (this.socket) {
      this.socket.emit('user_registered', { user })
    }
  }

  emitUserLoggedIn(user) {
    if (this.socket) {
      this.socket.emit('user_logged_in', { user })
    }
  }

  emitUserLoggedOut(user) {
    if (this.socket) {
      this.socket.emit('user_logged_out', { user })
    }
  }

  emitProfileUpdated(userId, changes) {
    if (this.socket) {
      this.socket.emit('profile_updated', { userId, changes })
    }
  }

  emitUserRoleChanged(userId, newRole) {
    if (this.socket) {
      this.socket.emit('user_role_changed', { userId, newRole })
    }
  }

  emitUserDeleted(userId) {
    if (this.socket) {
      this.socket.emit('user_deleted', { userId })
    }
  }

  // Listen to events
  onNewUser(callback) {
    if (this.socket) {
      this.socket.on('new_user', callback)
      this.listeners.set('new_user', callback)
    }
  }

  onUserActivity(callback) {
    if (this.socket) {
      this.socket.on('user_activity', callback)
      this.listeners.set('user_activity', callback)
    }
  }

  onProfileChanged(callback) {
    if (this.socket) {
      this.socket.on('profile_changed', callback)
      this.listeners.set('profile_changed', callback)
    }
  }

  onRoleUpdated(callback) {
    if (this.socket) {
      this.socket.on('role_updated', callback)
      this.listeners.set('role_updated', callback)
    }
  }

  onUserListUpdated(callback) {
    if (this.socket) {
      this.socket.on('user_list_updated', callback)
      this.listeners.set('user_list_updated', callback)
    }
  }

  // Listen for new notifications
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new_notification', callback)
      this.listeners.set('new_notification', callback)
    }
  }

  // Listen for new messages (chat)
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback)
      this.listeners.set('new_message', callback)
    }
  }

  // Remove listeners
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event))
      this.listeners.delete(event)
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback)
      })
      this.listeners.clear()
    }
  }
}

const socketService = new SocketService()

export default socketService

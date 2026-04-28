import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import socketService from '../services/socket'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const response = await authAPI.getMe()
        setUser(response.data.user)

        // Connect WebSocket and join user room
        socketService.connect()
        socketService.joinUserRoom(response.data.user.id)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { user: userData, accessToken, refreshToken, requiresTwoFactor, userId } = response.data

      if (requiresTwoFactor) {
        return { requiresTwoFactor: true, userId }
      }

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(userData)

      // Connect WebSocket
      socketService.connect()
      socketService.joinUserRoom(userData.id)
      socketService.emitUserLoggedIn(userData)

      return { success: true, user: userData }
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { user: newUser, accessToken, refreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(newUser)

      // Connect WebSocket
      socketService.connect()
      socketService.joinUserRoom(newUser.id)
      socketService.emitUserRegistered(newUser)

      return { success: true, user: newUser }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      if (user) {
        socketService.emitUserLoggedOut(user)
      }
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      socketService.disconnect()
    }
  }

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }))
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    loading,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

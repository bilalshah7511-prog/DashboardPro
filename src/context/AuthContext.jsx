import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, setCurrentUser, logout as logoutUser, initializeAdmin } from '../utils/storage'

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
    initializeAdmin()
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    setCurrentUser(userData)
  }

  const logout = () => {
    setUser(null)
    logoutUser()
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    login,
    logout,
    isAdmin,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

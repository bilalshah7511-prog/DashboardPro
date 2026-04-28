import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
}

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  getLoginRecords: (userId) => userId ? api.get(`/users/${userId}/login-records`) : api.get('/users/login-records'),
  getAllLoginRecords: () => api.get('/users/login-records/all')
}

// 2FA API
export const twoFactorAPI = {
  enable: () => api.post('/2fa/enable'),
  verify: (code) => api.post('/2fa/verify', { code }),
  disable: (code) => api.post('/2fa/disable', { code }),
  verifyLogin: (userId, code) => api.post('/2fa/verify-login', { userId, code })
}

// Export API
export const exportAPI = {
  exportUsersCSV: () => api.get('/export/users/csv', { responseType: 'blob' }),
  exportUsersPDF: () => api.get('/export/users/pdf', { responseType: 'blob' }),
  exportLoginRecordsCSV: () => api.get('/export/login-records/csv', { responseType: 'blob' }),
  exportLoginRecordsPDF: () => api.get('/export/login-records/pdf', { responseType: 'blob' })
}

// Blog API
export const blogAPI = {
  createBlog: (data) => api.post('/blogs', data),
  getAllBlogs: () => api.get('/blogs/all'),
  getMyBlogs: () => api.get('/blogs/my-blogs'),
  getAllBlogsAdmin: (status) => api.get('/blogs/admin/all', { params: { status } }),
  getBlogById: (id) => api.get(`/blogs/${id}`),
  updateBlog: (id, data) => api.put(`/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  approveBlog: (id) => api.put(`/blogs/${id}/approve`),
  rejectBlog: (id) => api.put(`/blogs/${id}/reject`)
}

export default api

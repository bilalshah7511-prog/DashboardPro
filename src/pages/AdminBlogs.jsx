import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogAPI } from '../services/api'
import { MdCheck, MdClose, MdDelete, MdImage, MdFilterList } from 'react-icons/md'

const AdminBlogs = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchBlogs()
  }, [filterStatus])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const status = filterStatus === 'all' ? null : filterStatus
      const response = await blogAPI.getAllBlogsAdmin(status)
      setBlogs(response.data.blogs)
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await blogAPI.approveBlog(id)
      fetchBlogs()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve blog')
    }
  }

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this blog?')) {
      try {
        await blogAPI.rejectBlog(id)
        fetchBlogs()
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject blog')
      }
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog permanently?')) {
      try {
        await blogAPI.deleteBlog(id)
        fetchBlogs()
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete blog')
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'PENDING' },
      approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'APPROVED' },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'REJECTED' }
    }
    return badges[status] || badges.pending
  }

  const statusCounts = {
    all: blogs.length,
    pending: blogs.filter(b => b.status === 'pending').length,
    approved: blogs.filter(b => b.status === 'approved').length,
    rejected: blogs.filter(b => b.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading blogs...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Blog Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage user blogs</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                filterStatus === status
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Blogs List */}
      {blogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No blogs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => {
            const badge = getStatusBadge(blog.status)
            return (
              <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Featured Image */}
                    <div className="flex-shrink-0">
                      {blog.featured_image ? (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full md:w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <MdImage className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(blog.created_at).toLocaleString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                            onClick={() => navigate(`/blogs/${blog.id}`)}
                          >
                            {blog.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {blog.description}
                          </p>

                          {/* Tags */}
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {blog.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Author Info */}
                          <div className="flex items-center space-x-2">
                            {blog.author_image ? (
                              <img src={blog.author_image} alt={blog.author_name} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                {blog.author_name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="font-medium text-gray-800 dark:text-white">{blog.author_name}</span>
                              <span className="text-gray-500 dark:text-gray-400"> • {blog.author_email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      {blog.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(blog.id)}
                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            title="Approve"
                          >
                            <MdCheck className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(blog.id)}
                            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            title="Reject"
                          >
                            <MdClose className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">Reject</span>
                          </button>
                        </>
                      )}
                      {blog.status === 'rejected' && (
                        <button
                          onClick={() => handleApprove(blog.id)}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          title="Approve"
                        >
                          <MdCheck className="w-5 h-5 md:mr-2" />
                          <span className="hidden md:inline">Approve</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        title="Delete"
                      >
                        <MdDelete className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminBlogs

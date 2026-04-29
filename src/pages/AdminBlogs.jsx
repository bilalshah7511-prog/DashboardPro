import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { blogAPI } from '../services/api'
import { MdCheck, MdClose, MdDelete, MdImage, MdFilterList } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'
import { EmptyState } from '../skeletons'
import ConfirmModal from '../components/molecules/ConfirmModal'
import { AddUserModal, EditUserModal } from '../components'

const AdminBlogs = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState({}) // Track loading state for each blog action
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })

  // Keep track of current request to prevent race conditions
  const currentFilterRef = useRef(filterStatus)
  
  useEffect(() => {
    currentFilterRef.current = filterStatus
  }, [filterStatus])

  // Fetch blogs when filter changes
  useEffect(() => {
    const fetchBlogsData = async () => {
      setLoading(true)
      try {
        const status = filterStatus === 'all' ? null : filterStatus
        const response = await blogAPI.getAllBlogsAdmin(status)
        
        // Only update if filter hasn't changed since request started
        if (currentFilterRef.current === filterStatus) {
          setBlogs(response.data.blogs || [])
        }
      } catch (error) {
        if (currentFilterRef.current === filterStatus) {
          console.error('Failed to fetch blogs:', error)
        }
      } finally {
        if (currentFilterRef.current === filterStatus) {
          setLoading(false)
        }
      }
    }
    
    fetchBlogsData()
  }, [filterStatus])
  
  // Refetch function for actions
  const fetchBlogs = async () => {
    const currentFilter = currentFilterRef.current
    try {
      const status = currentFilter === 'all' ? null : currentFilter
      const response = await blogAPI.getAllBlogsAdmin(status)
      if (currentFilterRef.current === currentFilter) {
        setBlogs(response.data.blogs || [])
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading({ ...actionLoading, [`approve-${id}`]: true })
    try {
      await blogAPI.approveBlog(id)
      fetchBlogs()
    } catch (error) {
      alert(error.response?.data?.message || t('error'))
    } finally {
      setActionLoading({ ...actionLoading, [`approve-${id}`]: false })
    }
  }

  const handleReject = (id) => {
    setConfirmModal({
      isOpen: true,
      message: t('confirmReject'),
      onConfirm: async () => {
        setActionLoading({ ...actionLoading, [`reject-${id}`]: true })
        try {
          await blogAPI.rejectBlog(id)
          setBlogs(blogs.filter(blog => blog.id !== id))
          alert(t('blogRejected'))
        } catch (error) {
          console.error('Failed to reject blog:', error)
          alert(error.response?.data?.message || t('failedRejectBlog'))
        } finally {
          setActionLoading({ ...actionLoading, [`reject-${id}`]: false })
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      },
      type: 'warning'
    })
  }

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      message: t('confirmDeleteBlog'),
      onConfirm: async () => {
        setActionLoading({ ...actionLoading, [`delete-${id}`]: true })
        try {
          await blogAPI.deleteBlog(id)
          setBlogs(blogs.filter(blog => blog.id !== id))
          alert(t('blogDeleted'))
        } catch (error) {
          console.error('Failed to delete blog:', error)
          alert(error.response?.data?.message || t('failedDeleteBlog'))
        } finally {
          setActionLoading({ ...actionLoading, [`delete-${id}`]: false })
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      },
      type: 'danger'
    })
  }

  const handleUnpublish = (id) => {
    setConfirmModal({
      isOpen: true,
      message: t('confirmUnpublish'),
      onConfirm: async () => {
        setActionLoading({ ...actionLoading, [`unpublish-${id}`]: true })
        try {
          await blogAPI.unpublishBlog(id)
          setBlogs(blogs.filter(blog => blog.id !== id))
          alert(t('blogUnpublished'))
        } catch (error) {
          console.error('Failed to unpublish blog:', error)
          alert(error.response?.data?.message || t('failedUnpublishBlog'))
        } finally {
          setActionLoading({ ...actionLoading, [`unpublish-${id}`]: false })
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      },
      type: 'warning'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: t('pending') },
      approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: t('approved') },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: t('rejected') },
      unpublished: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300', label: t('unpublished') }
    }
    return badges[status] || badges.pending
  }

  const statusCounts = {
    all: blogs.length,
    pending: blogs.filter(b => b.status === 'pending').length,
    approved: blogs.filter(b => b.status === 'approved').length,
    rejected: blogs.filter(b => b.status === 'rejected').length,
    unpublished: blogs.filter(b => b.status === 'unpublished').length
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('blogManagement')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('reviewAndManage')}</p>
      </div>

      {/* Filter Tabs - Always visible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected', 'unpublished'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              disabled={loading}
              className={`px-6 py-3 font-medium transition whitespace-nowrap disabled:opacity-50 ${
                filterStatus === status
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {t(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-full md:w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && blogs.length === 0 && (
        <EmptyState 
          icon="folder"
          title={filterStatus === 'all' ? t('noBlogs') : t('noStatusBlogs', { status: t(filterStatus) })}
          description={filterStatus === 'all' ? t('noBlogsDesc') : t('noStatusBlogsDesc', { status: t(filterStatus) })}
        />
      )}

      {/* Blogs List */}
      {!loading && blogs.length > 0 && (
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
                            disabled={actionLoading[`approve-${blog.id}`]}
                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('approved')}
                          >
                            {actionLoading[`approve-${blog.id}`] ? (
                              <FaSpinner className="w-5 h-5 animate-spin md:mr-2" />
                            ) : (
                              <MdCheck className="w-5 h-5 md:mr-2" />
                            )}
                            <span className="hidden md:inline">{t('approved')}</span>
                          </button>
                          <button
                            onClick={() => handleReject(blog.id)}
                            disabled={actionLoading[`reject-${blog.id}`]}
                            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('rejected')}
                          >
                            {actionLoading[`reject-${blog.id}`] ? (
                              <FaSpinner className="w-5 h-5 animate-spin md:mr-2" />
                            ) : (
                              <MdClose className="w-5 h-5 md:mr-2" />
                            )}
                            <span className="hidden md:inline">{t('rejected')}</span>
                          </button>
                        </>
                      )}
                      {blog.status === 'rejected' && (
                        <button
                          onClick={() => handleApprove(blog.id)}
                          disabled={actionLoading[`approve-${blog.id}`]}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('approved')}
                        >
                          {actionLoading[`approve-${blog.id}`] ? (
                            <FaSpinner className="w-5 h-5 animate-spin md:mr-2" />
                          ) : (
                            <MdCheck className="w-5 h-5 md:mr-2" />
                          )}
                          <span className="hidden md:inline">{t('approved')}</span>
                        </button>
                      )}
                      {blog.status === 'approved' && (
                        <button
                          onClick={() => handleUnpublish(blog.id)}
                          disabled={actionLoading[`unpublish-${blog.id}`]}
                          className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('unpublish')}
                        >
                          {actionLoading[`unpublish-${blog.id}`] ? (
                            <FaSpinner className="w-5 h-5 animate-spin md:mr-2" />
                          ) : (
                            <MdClose className="w-5 h-5 md:mr-2" />
                          )}
                          <span className="hidden md:inline">{t('unpublish')}</span>
                        </button>
                      )}
                      {blog.status === 'unpublished' && (
                        <button
                          onClick={() => handleApprove(blog.id)}
                          disabled={actionLoading[`approve-${blog.id}`]}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('publish')}
                        >
                          {actionLoading[`approve-${blog.id}`] ? (
                            <FaSpinner className="w-5 h-5 animate-spin md:mr-2" />
                          ) : (
                            <MdCheck className="w-5 h-5 md:mr-2" />
                          )}
                          <span className="hidden md:inline">{t('publish')}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={actionLoading[`delete-${blog.id}`]}
                        className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('delete')}
                      >
                        {actionLoading[`delete-${blog.id}`] ? (
                          <FaSpinner className="w-5 h-5 animate-spin md:mr-2" />
                        ) : (
                          <MdDelete className="w-5 h-5 md:mr-2" />
                        )}
                        <span className="hidden md:inline">{t('delete')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        confirmText={t('yes')}
        cancelText={t('cancel')}
        type={confirmModal.type}
      />
    </div>
  )
}

export default AdminBlogs

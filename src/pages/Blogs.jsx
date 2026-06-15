import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { blogAPI } from '../services/api'
import { MdAdd, MdEdit, MdDelete, MdImage, MdSearch, MdFavorite, MdChat, MdVisibility } from 'react-icons/md'
import CreateBlogModal from '../components/organisms/CreateBlogModal'
import EditBlogModal from '../components/organisms/EditBlogModal'
import { BlogCardSkeletonGrid, EmptyState } from '../skeletons'
import ConfirmModal from '../components/molecules/ConfirmModal'
import UserHoverCard from '../components/molecules/UserHoverCard'

const Blogs = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [allBlogs, setAllBlogs] = useState([])
  const [myBlogs, setMyBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [myBlogsFilter, setMyBlogsFilter] = useState('all')
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })

  useEffect(() => {
    fetchBlogs()
  }, [activeTab])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      if (activeTab === 'all') {
        const response = await blogAPI.getAllBlogs()
        console.log('📊 All blogs response:', response.data)
        setAllBlogs(response.data.blogs || [])
      } else {
        const response = await blogAPI.getMyBlogs()
        console.log('📊 My blogs response:', response.data)
        setMyBlogs(response.data.blogs || [])
      }
    } catch (error) {
      console.error('❌ Failed to fetch blogs:', error)
      console.error('Error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      message: t('confirmDeleteBlog'),
      onConfirm: async () => {
        try {
          await blogAPI.deleteBlog(id)
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
          fetchBlogs()
        } catch (error) {
          console.error('Failed to delete blog:', error)
          alert(error.response?.data?.message || 'Failed to delete blog')
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
        try {
          await blogAPI.unpublishBlog(id)
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
          fetchBlogs()
        } catch (error) {
          console.error('Failed to unpublish blog:', error)
          alert(error.response?.data?.message || 'Failed to unpublish blog')
        }
      },
      type: 'warning'
    })
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setShowEditModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      unpublished: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
    return badges[status] || badges.pending
  }

  const blogs = activeTab === 'all' ? allBlogs : myBlogs

  const filteredBlogs = blogs.filter(blog => {
    // Search filter
    const query = searchQuery.toLowerCase()
    const titleMatch = blog.title?.toLowerCase().includes(query)
    const authorMatch = blog.author_name?.toLowerCase().includes(query)
    const tagMatch = blog.tags?.some(tag => tag.toLowerCase().includes(query))
    const matchesSearch = titleMatch || authorMatch || tagMatch
    
    // Status filter for My Blogs
    if (activeTab === 'my' && myBlogsFilter !== 'all') {
      return matchesSearch && blog.status === myBlogsFilter
    }
    
    return matchesSearch
  })

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('blogs')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('readAndShare')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <MdAdd className="w-5 h-5" />
          <span>{t('createBlog')}</span>
        </button>
      </div>

      {/* Tabs with Search on Right */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          {/* Main Tabs */}
          <div className="flex">
            <button
              onClick={() => { setActiveTab('all'); setMyBlogsFilter('all'); }}
              disabled={loading}
              className={`px-6 py-3 font-medium transition disabled:opacity-50 ${
                activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {t('allBlogs')}
            </button>
            <button
              onClick={() => setActiveTab('my')}
              disabled={loading}
              className={`px-6 py-3 font-medium transition disabled:opacity-50 ${
                activeTab === 'my'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {t('myBlogs')}
            </button>
          </div>
          {/* Search - Right Side */}
          <div className="px-4 py-2">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs - Only for My Blogs */}
        {activeTab === 'my' && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{t('filter')}:</span>
            {['all', 'approved', 'unpublished', 'rejected', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setMyBlogsFilter(status)}
                disabled={loading}
                className={`px-3 py-1 text-xs font-medium rounded-full transition disabled:opacity-50 ${
                  myBlogsFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {t(status)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && <BlogCardSkeletonGrid count={6} />}

      {/* Empty State */}
      {!loading && filteredBlogs.length === 0 && (
        <EmptyState 
          icon="folder"
          title={searchQuery ? t('noSearchResults') : activeTab === 'all' ? t('No Blogs Yet') : t('No My Blogs Yet')}
          description={searchQuery ? t('tryDifferentSearch') : activeTab === 'all' ? t('beFirstToCreate') : t('Create Your First Blog')}
          action={activeTab === 'my' ? { label: t('createBlog'), onClick: () => setShowCreateModal(true) } : null}
        />
      )}

      {/* Blogs Grid */}
      {!loading && filteredBlogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition">
              {/* Featured Image */}
              {blog.featured_image ? (
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <MdImage className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Status Badge (only in My Blogs) */}
                {activeTab === 'my' && (
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${getStatusBadge(blog.status)}`}>
                    {blog.status.toUpperCase()}
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                  onClick={() => navigate(`/blogs/${blog.id}`)}
                >
                  {blog.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {blog.description}
                </p>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats - Likes, Comments, Views */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <MdFavorite className="w-4 h-4" />
                    {blog.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MdChat className="w-4 h-4" />
                    {blog.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MdVisibility className="w-4 h-4" />
                    {blog.views || 0}
                  </span>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 relative z-50">
                  <div className="flex items-center space-x-2">
                    {blog.author_image ? (
                      <img src={blog.author_image} alt={blog.author_name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {blog.author_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <UserHoverCard
                        userId={blog.user_id}
                        userName={blog.author_name}
                        userImage={blog.author_image}
                        placement="top"
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{blog.author_name}</p>
                      </UserHoverCard>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions (only for own blogs) */}
                  {activeTab === 'my' && (
                    <div className="flex items-center space-x-2">
                      {blog.status === 'approved' && (
                        <button
                          onClick={() => handleUnpublish(blog.id)}
                          className="px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition"
                        >
                          {t('unpublish')}
                        </button>
                      )}
                      {blog.status === 'unpublished' && (
                        <span className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {t('unpublished')}
                        </span>
                      )}
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateBlogModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchBlogs()
          }}
        />
      )}

      {showEditModal && editingBlog && (
        <EditBlogModal
          blog={editingBlog}
          onClose={() => {
            setShowEditModal(false)
            setEditingBlog(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setEditingBlog(null)
            fetchBlogs()
          }}
        />
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

export default Blogs

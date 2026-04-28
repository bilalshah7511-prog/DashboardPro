import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { blogAPI } from '../services/api'
import { MdAdd, MdEdit, MdDelete, MdImage, MdSearch } from 'react-icons/md'
import CreateBlogModal from '../components/CreateBlogModal'
import EditBlogModal from '../components/EditBlogModal'

const Blogs = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [allBlogs, setAllBlogs] = useState([])
  const [myBlogs, setMyBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBlogs()
  }, [activeTab])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      if (activeTab === 'all') {
        const response = await blogAPI.getAllBlogs()
        setAllBlogs(response.data.blogs)
      } else {
        const response = await blogAPI.getMyBlogs()
        setMyBlogs(response.data.blogs)
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.deleteBlog(id)
        fetchBlogs()
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete blog')
      }
    }
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setShowEditModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return badges[status] || badges.pending
  }

  const blogs = activeTab === 'all' ? allBlogs : myBlogs

  const filteredBlogs = blogs.filter(blog => {
    const query = searchQuery.toLowerCase()
    const titleMatch = blog.title?.toLowerCase().includes(query)
    const authorMatch = blog.author_name?.toLowerCase().includes(query)
    const tagMatch = blog.tags?.some(tag => tag.toLowerCase().includes(query))
    return titleMatch || authorMatch || tagMatch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading blogs...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Read and share your thoughts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <MdAdd className="w-5 h-5" />
          <span>Create Blog</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            All Blogs
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'my'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            My Blogs
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, author name, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Blogs Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No blogs found matching your search' : activeTab === 'all' ? 'No blogs published yet' : 'You haven\'t created any blogs yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition overflow-hidden">
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

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    {blog.author_image ? (
                      <img src={blog.author_image} alt={blog.author_name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {blog.author_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{blog.author_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions (only for own blogs) */}
                  {activeTab === 'my' && (
                    <div className="flex space-x-2">
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
    </div>
  )
}

export default Blogs

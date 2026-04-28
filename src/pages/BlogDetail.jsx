import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blogAPI } from '../services/api'
import { MdArrowBack, MdImage, MdPerson, MdCalendarToday } from 'react-icons/md'

const BlogDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBlog()
  }, [id])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await blogAPI.getBlogById(id)
      setBlog(response.data.blog)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load blog')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading blog...</div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Blog not found'}</p>
        <button
          onClick={() => navigate('/blogs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Blogs
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/blogs')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition"
      >
        <MdArrowBack className="w-5 h-5" />
        <span>Back to Blogs</span>
      </button>

      {/* Blog Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Featured Image */}
        {blog.featured_image ? (
          <img
            src={blog.featured_image}
            alt={blog.title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MdImage className="w-24 h-24 text-white opacity-50" />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            {/* Author */}
            <div className="flex items-center space-x-2">
              {blog.author_image ? (
                <img src={blog.author_image} alt={blog.author_name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {blog.author_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{blog.author_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{blog.author_email}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <MdCalendarToday className="w-4 h-4" />
              <span className="text-sm">
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {blog.description}
            </p>
          </div>

          {/* Published Date */}
          {blog.published_at && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Published on {new Date(blog.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogDetail

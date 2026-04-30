import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blogAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { MdArrowBack, MdImage, MdPerson, MdCalendarToday, MdFavorite, MdFavoriteBorder, MdChat, MdVisibility, MdSend, MdDelete, MdArticle } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'
import ConfirmModal from '../components/molecules/ConfirmModal'
import UserHoverCard from '../components/molecules/UserHoverCard'

const BlogDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likes, setLikes] = useState({ count: 0, userLiked: false })
  const [comments, setComments] = useState([])
  const [commentContent, setCommentContent] = useState('')
  const [viewCount, setViewCount] = useState(0)
  const [actionLoading, setActionLoading] = useState({})
  const [latestBlogs, setLatestBlogs] = useState([])
  const [latestBlogsLoading, setLatestBlogsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })

  const trackView = async () => {
    try {
      const response = await blogAPI.trackBlogView(id)
      setViewCount(response.data.viewCount)
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  useEffect(() => {
    fetchBlog()
    fetchLikes()
    fetchComments()
    trackView()
    fetchLatestBlogs()
  }, [id])

  const fetchLatestBlogs = async () => {
    try {
      const response = await blogAPI.getLatestBlogs(5)
      const filtered = response.data.blogs?.filter(b => b.id.toString() !== id) || []
      setLatestBlogs(filtered.slice(0, 4))
    } catch (error) {
      console.error('Failed to fetch latest blogs:', error)
    } finally {
      setLatestBlogsLoading(false)
    }
  }

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await blogAPI.getBlogById(id)
      setBlog(response.data.blog)
    } catch (error) {
      setError(error.response?.data?.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchLikes = async () => {
    try {
      const response = await blogAPI.getBlogLikes(id)
      setLikes(response.data)
    } catch (error) {
      console.error('Failed to fetch likes:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await blogAPI.getBlogComments(id)
      const allComments = response.data.comments || []
      
      // Organize: Parent comments first (sorted by date), then their replies grouped under
      const parentComments = allComments
        .filter(c => !c.parent_id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      const replies = allComments.filter(c => c.parent_id)
      
      // Group replies by parent_id
      const repliesByParent = {}
      replies.forEach(reply => {
        if (!repliesByParent[reply.parent_id]) {
          repliesByParent[reply.parent_id] = []
        }
        repliesByParent[reply.parent_id].push(reply)
      })
      
      // Build organized list: parent + its replies
      const organized = []
      parentComments.forEach(parent => {
        organized.push(parent)
        const childReplies = repliesByParent[parent.id] || []
        childReplies.forEach(reply => organized.push(reply))
      })
      
      setComments(organized)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  // Update view count when blog data changes
  useEffect(() => {
    if (blog?.view_count !== undefined) {
      setViewCount(blog.view_count)
    }
  }, [blog])

  const handleLike = async () => {
    if (!user) return
    setActionLoading({ ...actionLoading, like: true })
    try {
      if (likes.userLiked) {
        await blogAPI.unlikeBlog(id)
        setLikes({ count: likes.count - 1, userLiked: false })
      } else {
        await blogAPI.likeBlog(id)
        setLikes({ count: likes.count + 1, userLiked: true })
      }
    } catch (error) {
      console.error('Failed to like:', error)
    } finally {
      setActionLoading({ ...actionLoading, like: false })
    }
  }

  const handleComment = async (e, parentId = null) => {
    e.preventDefault()
    const content = parentId ? replyContent : commentContent
    if (!user || !content.trim()) return
    
    setActionLoading({ ...actionLoading, [parentId ? 'reply' : 'comment']: true })
    try {
      const response = await blogAPI.addComment(id, content.trim(), parentId)
      if (response.data && response.data.comment) {
        const newComment = response.data.comment
        
        if (parentId) {
          // For reply: insert after parent comment, not at top
          const parentIndex = comments.findIndex(c => c.id === parentId)
          if (parentIndex >= 0) {
            const newComments = [...comments]
            newComments.splice(parentIndex + 1, 0, newComment)
            setComments(newComments)
          } else {
            setComments([...comments, newComment])
          }
          setReplyContent('')
          setReplyingTo(null)
        } else {
          // For parent comment: add at top
          setComments([newComment, ...comments])
          setCommentContent('')
        }
      } else {
        console.error('Invalid response format:', response)
        alert('Failed to add comment. Please try again.')
      }
    } catch (error) {
      console.error('=== COMMENT ERROR ===')
      console.error('Error object:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      console.error('=== END ERROR ===')
      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to add comment'}`)
    } finally {
      setActionLoading({ ...actionLoading, [parentId ? 'reply' : 'comment']: false })
    }
  }

  const handleReplyClick = (comment) => {
    setReplyingTo(replyingTo?.id === comment.id ? null : comment)
    setReplyContent('')
  }

  const handleDeleteComment = (commentId) => {
    setConfirmModal({
      isOpen: true,
      message: t('confirmDeleteComment'),
      onConfirm: async () => {
        try {
          await blogAPI.deleteComment(id, commentId)
          setComments(comments.filter(c => c.id !== commentId))
        } catch (error) {
          console.error('Failed to delete comment:', error)
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      },
      type: 'danger'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Blog Content - Left Side (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Image Skeleton */}
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

            {/* Content Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
              {/* Title Skeleton */}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />

              {/* Meta Info Skeleton */}
              <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>

              {/* Description Skeleton */}
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              </div>

              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-2 pt-4">
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="w-14 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>

              {/* Stats Skeleton */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>

            {/* Comments Section Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side (1/3 width) */}
          <div className="space-y-6">
            {/* Latest Blogs Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-red-500 mb-4">{error || t('error')}</p>
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
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/blogs')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition"
      >
        <MdArrowBack className="w-5 h-5" />
        <span>{t('blogs')}</span>
      </button>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Blog Content - Left Side (2/3 width) */}
        <div className="lg:col-span-2">
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
                    <UserHoverCard
                      userId={blog.user_id}
                      userName={blog.author_name}
                      userImage={blog.author_image}
                      placement="right"
                    >
                      <p className="font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{blog.author_name}</p>
                    </UserHoverCard>
                    <p className="text-sm text-gray-500">{t('author')}</p>
                  </div>
                </div>

                {/* Date */}
                {blog.published_at && (
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <MdCalendarToday className="w-5 h-5" />
                    <p className="text-sm">
                      {t('published')} {new Date(blog.published_at).toLocaleDateString('en-US', {
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

              {/* Description */}
              <div className="prose dark:prose-invert max-w-none mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {blog.description}
                </p>
              </div>

              {/* Like, Comment, View Stats */}
              <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200 dark:border-gray-700 mb-6">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={!user || actionLoading.like}
                  className={`flex items-center gap-2 transition ${
                    likes.userLiked
                      ? 'text-red-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                  } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {actionLoading.like ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : likes.userLiked ? (
                    <MdFavorite className="w-5 h-5" />
                  ) : (
                    <MdFavoriteBorder className="w-5 h-5" />
                  )}
                  <span>{likes.count}</span>
                </button>

                {/* Comments */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <MdChat className="w-5 h-5" />
                  <span>{comments.length}</span>
                </div>

                {/* Views */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <MdVisibility className="w-5 h-5" />
                  <span>{viewCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {t('comments')}
            </h2>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="mb-8">
                <div className="flex gap-3">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {user?.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder={t('writeComment')}
                        rows={Math.min(5, Math.max(2, commentContent.split('\n').length))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none min-h-[60px] text-sm"
                        style={{ overflow: 'hidden' }}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {commentContent.length}/500
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      {commentContent && (
                        <button
                          type="button"
                          onClick={() => setCommentContent('')}
                          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                        >
                          {t('cancel')}
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={actionLoading.comment || !commentContent.trim() || commentContent.length > 500}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        {actionLoading.comment ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <MdSend className="w-4 h-4" />
                            {t('postComment')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('noComments')}</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={`${comment.parent_id ? 'ml-12 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {comment.author_image ? (
                          <img src={comment.author_image} alt={comment.author_name} className="w-9 h-9 rounded-full" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {comment.author_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-4 py-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <UserHoverCard
                              userId={comment.user_id}
                              userName={comment.author_name}
                              userImage={comment.author_image}
                              placement="right"
                            >
                              <p className="font-semibold text-gray-800 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{comment.author_name}</p>
                            </UserHoverCard>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                              {(user?.id === comment.user_id || user?.role === 'admin') && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-gray-400 hover:text-red-500 transition"
                                >
                                  <MdDelete className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Show reply indicator with highlighted username */}
                          {comment.parent_id && comment.parent_author && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                              {t('replyingTo')} <span className="font-bold bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">@{comment.parent_author}</span>
                            </p>
                          )}
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                        </div>
                        
                        {/* Reply Button */}
                        {user && (
                          <div className="flex items-center gap-4 mt-1 ml-1">
                            <button
                              onClick={() => handleReplyClick(comment)}
                              className={`text-xs font-medium transition ${
                                replyingTo?.id === comment.id 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                            >
                              {replyingTo?.id === comment.id ? t('cancelReply') : t('reply')}
                            </button>
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo?.id === comment.id && (
                          <form onSubmit={(e) => handleComment(e, comment.id)} className="mt-3 flex gap-2">
                            <div className="flex-1">
                              <div className="relative">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder={`${t('replyTo')} ${comment.author_name}...`}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                                  autoFocus
                                />
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyingTo(null)}
                                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                                >
                                  {t('cancel')}
                                </button>
                                <button
                                  type="submit"
                                  disabled={actionLoading.reply || !replyContent.trim()}
                                  className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                  {actionLoading.reply ? (
                                    <FaSpinner className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <MdSend className="w-3 h-3" />
                                      {t('postReply')}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Latest Blogs (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <MdArticle className="w-6 h-6" />
              {t('latestBlogs')}
            </h3>

            {latestBlogsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : latestBlogs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noBlogs')}</p>
            ) : (
              <div className="space-y-4">
                {latestBlogs.map((latestBlog, index) => (
                  <div key={latestBlog.id}>
                    <div
                      onClick={() => navigate(`/blogs/${latestBlog.id}`)}
                      className="cursor-pointer group"
                    >
                    {/* Card Image */}
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                      {latestBlog.featured_image ? (
                        <img
                          src={latestBlog.featured_image}
                          alt={latestBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <MdArticle className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {latestBlog.title}
                    </h4>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-2">
                      {latestBlog.author_image ? (
                        <img
                          src={latestBlog.author_image}
                          alt={latestBlog.author_name}
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                          {latestBlog.author_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <UserHoverCard
                        userId={latestBlog.user_id}
                        userName={latestBlog.author_name}
                        userImage={latestBlog.author_image}
                        placement="left"
                      >
                        <span className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{latestBlog.author_name}</span>
                      </UserHoverCard>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MdFavorite className="w-3 h-3" />
                        {latestBlog.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MdChat className="w-3 h-3" />
                        {latestBlog.comments_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MdVisibility className="w-3 h-3" />
                        {latestBlog.view_count || 0}
                      </span>
                    </div>
                    </div>
                    {/* Divider between blogs */}
                    {index < latestBlogs.length - 1 && (
                      <div className="border-b border-gray-200 dark:border-gray-700 mt-4 mb-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default BlogDetail

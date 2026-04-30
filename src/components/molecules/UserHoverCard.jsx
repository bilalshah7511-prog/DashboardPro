import { useState, useEffect, useRef, useCallback } from 'react'
import { userAPI } from '../../services/api'
import { MdFavorite, MdVisibility, MdChat, MdArticle, MdCancel, MdPendingActions } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const UserHoverCard = ({ userId, userName, userImage, children, placement = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const hoverTimeout = useRef(null)
  const cardRef = useRef(null)
  const triggerRef = useRef(null)

  const fetchStats = useCallback(async () => {
    if (!userId || stats) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await userAPI.getUserBlogStats(userId)
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [userId, stats])

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current)
    hoverTimeout.current = setTimeout(() => {
      setIsVisible(true)
      fetchStats()
    }, 200) // Delay for better UX
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current)
    hoverTimeout.current = setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current)
      }
    }
  }, [])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  const getPositionClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-3 left-1/2 -translate-x-1/2'
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2'
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2'
      case 'bottom':
      default:
        return 'top-full mt-2 left-1/2 -translate-x-1/2'
    }
  }

  const getArrowClasses = () => {
    switch (placement) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800'
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 -ml-1 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white dark:border-r-gray-800'
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 -mr-1 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white dark:border-l-gray-800'
      case 'bottom':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800'
    }
  }

  const displayUser = stats?.user || { name: userName, profile_image: userImage }

  return (
    <div className="relative inline-block z-50">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer inline-flex items-center"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={cardRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`absolute z-[100] ${getPositionClasses()} w-72`}
        >
          {/* Arrow */}
          <div className={`absolute w-0 h-0 ${getArrowClasses()}`}></div>

          {/* Card Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
              <div className="flex items-center gap-3">
                {displayUser.profile_image ? (
                  <img
                    src={displayUser.profile_image}
                    alt={displayUser.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg shadow-md">
                    {displayUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">
                    {displayUser.name}
                  </h4>
                  <p className="text-blue-100 text-xs">
                    {displayUser.role === 'admin' ? 'Administrator' : 'Author'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 ">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <FaSpinner className="animate-spin text-blue-500 text-xl" />
                </div>
              ) : error ? (
                <p className="text-center text-red-500 text-sm py-4">{error}</p>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Published Blogs */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MdArticle className="text-green-600 dark:text-green-400 text-lg" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Published</span>
                    </div>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                      {stats.stats.publishedCount}
                    </p>
                  </div>

                  {/* Rejected Blogs */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MdCancel className="text-red-600 dark:text-red-400 text-lg" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Rejected</span>
                    </div>
                    <p className="text-xl font-bold text-red-700 dark:text-red-400">
                      {stats.stats.rejectedCount}
                    </p>
                  </div>

                  {/* Pending Blogs */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MdPendingActions className="text-yellow-600 dark:text-yellow-400 text-lg" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
                    </div>
                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                      {stats.stats.pendingCount}
                    </p>
                  </div>

                  {/* Total Likes */}
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MdFavorite className="text-pink-600 dark:text-pink-400 text-lg" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Likes</span>
                    </div>
                    <p className="text-xl font-bold text-pink-700 dark:text-pink-400">
                      {stats.stats.totalLikes}
                    </p>
                  </div>

                  {/* Total Views */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MdVisibility className="text-blue-600 dark:text-blue-400 text-lg" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Views</span>
                    </div>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                      {stats.stats.totalViews}
                    </p>
                  </div>

                  {/* Total Comments */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MdChat className="text-purple-600 dark:text-purple-400 text-lg" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Comments</span>
                    </div>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                      {stats.stats.totalComments}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {stats?.user?.created_at && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Member since {new Date(stats.user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserHoverCard

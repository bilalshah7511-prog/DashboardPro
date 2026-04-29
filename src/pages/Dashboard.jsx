import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { userAPI } from '../services/api'
import socketService from '../services/socket'
import StatsCard from '../components/atoms/StatsCard'
import EditProfileModal from '../components/organisms/EditProfileModal'
import LoginDetailsModal from '../components/organisms/LoginDetailsModal'
import { StatsSkeletonGrid, EmptyState } from '../skeletons'
import { MdPeople, MdLock, MdBarChart, MdSettings, MdAccessTime, MdCheckCircle, MdCalendarToday, MdEdit, MdArticle, MdFavorite, MdChat, MdVisibility } from 'react-icons/md'
import { blogAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [latestBlogs, setLatestBlogs] = useState([])
  const [blogsLoading, setBlogsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchLatestBlogs()

    // Setup WebSocket listeners
    socketService.onUserActivity(() => {
      fetchStats()
    })

    socketService.onUserListUpdated(() => {
      fetchStats()
    })

    return () => {
      socketService.off('user_activity')
      socketService.off('user_list_updated')
    }
  }, [])

  const fetchLatestBlogs = async () => {
    try {
      const response = await blogAPI.getLatestBlogs(6)
      setLatestBlogs(response.data.blogs || [])
    } catch (error) {
      console.error('Failed to fetch latest blogs:', error)
    } finally {
      setBlogsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await userAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = isAdmin()
    ? [
        { title: t('totalUsers'), value: stats?.totalUsers || 0, icon: MdPeople, color: 'blue', clickable: false },
        { title: t('totalLogins'), value: stats?.totalLogins || 0, icon: MdLock, color: 'green', clickable: true, onClick: () => setShowLoginModal(true) },
        { title: t('activeUsers'), value: stats?.activeToday || 0, icon: MdBarChart, color: 'purple', clickable: false },
        { title: t('adminPanel'), value: t('active'), icon: MdSettings, color: 'orange', clickable: false }
      ]
    : [
        { title: t('myLogins'), value: stats?.userLogins || 0, icon: MdLock, color: 'blue', clickable: true, onClick: () => setShowLoginModal(true) },
        { title: t('lastLogin'), value: stats?.lastLogin ? new Date(stats.lastLogin).toLocaleString() : 'N/A', icon: MdAccessTime, color: 'green', clickable: false },
        { title: t('accountStatus'), value: t('active'), icon: MdCheckCircle, color: 'purple', clickable: false },
        { title: t('createdAt'), value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A', icon: MdCalendarToday, color: 'orange', clickable: false }
      ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('welcomeBack')}, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('recentActivity')}</p>
      </div>

      {/* Stats Skeleton */}
      {loading && <StatsSkeletonGrid count={4} />}

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      )}

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('profile')}</h2>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <MdEdit className="w-4 h-4" />
            <span>{t('editProfile')}</span>
          </button>
        </div>

        <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-medium border-4 border-blue-100 dark:border-blue-900">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">{t('gender')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.gender || 'Not specified'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">{t('email')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">{t('role')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">User ID:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">{t('createdAt')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}

      {/* Latest Blogs Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            <MdArticle className="inline-block mr-2" />
            {t('latestBlogs')}
          </h2>
          <button
            onClick={() => navigate('/blogs')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {t('viewAll')} →
          </button>
        </div>

        {blogsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : latestBlogs.length === 0 ? (
          <EmptyState 
            icon="folder"
            title={t('No Blogs Yet')}
            description={t('Be First To Create')}
            action={{ label: t('exploreBlogs'), onClick: () => navigate('/blogs') }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestBlogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => navigate(`/blogs/${blog.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                  {blog.featured_image ? (
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <MdArticle className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {blog.description}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    {blog.author_image ? (
                      <img
                        src={blog.author_image}
                        alt={blog.author_name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                        {blog.author_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">{blog.author_name}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                      {blog.view_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showLoginModal && (
        <LoginDetailsModal
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}

export default Dashboard

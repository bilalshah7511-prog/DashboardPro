import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { userAPI } from '../services/api'
import socketService from '../services/socket'
import StatsCard from '../components/StatsCard'
import EditProfileModal from '../components/EditProfileModal'
import LoginDetailsModal from '../components/LoginDetailsModal'
import { MdPeople, MdLock, MdBarChart, MdSettings, MdAccessTime, MdCheckCircle, MdCalendarToday, MdEdit } from 'react-icons/md'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const { t } = useTranslation()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  const statsCards = isAdmin()
    ? [
        { title: t('totalUsers'), value: stats?.totalUsers || 0, icon: MdPeople, color: 'blue', clickable: false },
        { title: t('totalLogins'), value: stats?.totalLogins || 0, icon: MdLock, color: 'green', clickable: true, onClick: () => setShowLoginModal(true) },
        { title: t('activeUsers'), value: stats?.activeToday || 0, icon: MdBarChart, color: 'purple', clickable: false },
        { title: 'Admin Panel', value: 'Active', icon: MdSettings, color: 'orange', clickable: false }
      ]
    : [
        { title: 'My Logins', value: stats?.userLogins || 0, icon: MdLock, color: 'blue', clickable: true, onClick: () => setShowLoginModal(true) },
        { title: t('lastLogin'), value: stats?.lastLogin ? new Date(stats.lastLogin).toLocaleString() : 'N/A', icon: MdAccessTime, color: 'green', clickable: false },
        { title: 'Account Status', value: 'Active', icon: MdCheckCircle, color: 'purple', clickable: false },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Account Information</h2>
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

      {showLoginModal && (
        <LoginDetailsModal
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}

export default Dashboard

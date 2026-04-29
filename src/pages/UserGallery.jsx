import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'
import socketService from '../services/socket'
import { EmptyState } from '../skeletons'
import { FaMale, FaFemale, FaGenderless, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa'

const UserGallery = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()

    // Listen for real-time updates
    socketService.onNewUser(() => fetchUsers())
    socketService.onProfileChanged(() => fetchUsers())
    socketService.onRoleUpdated(() => fetchUsers())
    socketService.onUserListUpdated(() => fetchUsers())

    return () => {
      socketService.off('new_user')
      socketService.off('profile_changed')
      socketService.off('role_updated')
      socketService.off('user_list_updated')
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll()
      // Show all users
      setUsers(response.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'Male':
        return <FaMale className="text-blue-600" />
      case 'Female':
        return <FaFemale className="text-pink-600" />
      default:
        return <FaGenderless className="text-gray-600" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Profiles</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all registered user profiles and information</p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-24" />
              <div className="px-6 pb-6 pt-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 -mt-12 mx-auto border-4 border-white dark:border-gray-800" />
                <div className="mt-4 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
                  <div className="space-y-2 pt-2">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <EmptyState 
          icon="folder"
          title="No users found"
          description="There are no registered users yet."
        />
      )}

      {/* Users Grid */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>

              {/* Profile Image */}
              <div className="relative px-6 -mt-12">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg mx-auto"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg mx-auto">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="px-6 pb-6 pt-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-1">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">{user.email}</p>

                {/* Details Grid */}
                <div className="space-y-3">
                  {/* Gender */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getGenderIcon(user.gender)}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Gender</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{user.gender || 'Not specified'}</span>
                  </div>

                  {/* Role */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FaShieldAlt className="text-purple-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Role</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-orange-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Joined</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserGallery

import { getUsers } from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import { FaMale, FaFemale, FaGenderless, FaCalendarAlt, FaShieldAlt, FaUserCircle } from 'react-icons/fa'

const UserGallery = () => {
  const { user: currentUser } = useAuth()

  // Show all users except the current logged-in admin
  const users = getUsers().filter(u => u.id !== currentUser?.id)

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
        <h1 className="text-3xl font-bold text-gray-800">User Profiles</h1>
        <p className="text-gray-600 mt-1">View all registered user profiles and information</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>

              {/* Profile Image */}
              <div className="relative px-6 -mt-12">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg mx-auto">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="px-6 pb-6 pt-4">
                <h3 className="text-xl font-bold text-gray-800 text-center mb-1">{user.name}</h3>
                <p className="text-sm text-gray-500 text-center mb-4">{user.email}</p>

                {/* Details Grid */}
                <div className="space-y-3">
                  {/* Gender */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getGenderIcon(user.gender)}
                      <span className="text-sm font-medium text-gray-600">Gender</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{user.gender || 'Not specified'}</span>
                  </div>

                  {/* Role */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FaShieldAlt className="text-purple-600" />
                      <span className="text-sm font-medium text-gray-600">Role</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-orange-600" />
                      <span className="text-sm font-medium text-gray-600">Joined</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{formatDate(user.createdAt)}</span>
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

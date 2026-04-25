import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsers, getLoginRecords, getUserLoginRecords } from '../utils/storage'
import StatsCard from '../components/StatsCard'
import EditProfileModal from '../components/EditProfileModal'
import LoginDetailsModal from '../components/LoginDetailsModal'
import { MdPeople, MdLock, MdBarChart, MdSettings, MdAccessTime, MdCheckCircle, MdCalendarToday, MdEdit } from 'react-icons/md'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const users = getUsers()
  const allLogins = getLoginRecords()
  const userLogins = getUserLoginRecords(user?.id)

  // Exclude owner admin from user count only if current user is not owner
  const visibleUsers = user?.email === 'admin@gmail.com'
    ? users
    : users.filter(u => u.email !== 'admin@gmail.com')

  const stats = isAdmin()
    ? [
        { title: 'Total Users', value: visibleUsers.length, icon: MdPeople, color: 'blue', clickable: false },
        { title: 'Total Logins', value: allLogins.length, icon: MdLock, color: 'green', clickable: true, onClick: () => setShowLoginModal(true) },
        { title: 'Active Today', value: getTodayLogins(allLogins), icon: MdBarChart, color: 'purple', clickable: false },
        { title: 'Admin Panel', value: 'Active', icon: MdSettings, color: 'orange', clickable: false }
      ]
    : [
        { title: 'My Logins', value: userLogins.length, icon: MdLock, color: 'blue', clickable: true, onClick: () => setShowLoginModal(true) },
        { title: 'Last Login', value: getLastLoginTime(userLogins), icon: MdAccessTime, color: 'green', clickable: false },
        { title: 'Account Status', value: 'Active', icon: MdCheckCircle, color: 'purple', clickable: false },
        { title: 'Member Since', value: getMemberSince(user), icon: MdCalendarToday, color: 'orange', clickable: false }
      ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <MdEdit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-200">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-medium border-4 border-blue-100">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{user?.name}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gender:</span>
            <span className="font-medium text-gray-800">{user?.gender || 'Not specified'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-800">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium text-gray-800 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">User ID:</span>
            <span className="font-medium text-gray-800">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Member Since:</span>
            <span className="font-medium text-gray-800">{getMemberSince(user)}</span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}

      {showLoginModal && (
        <LoginDetailsModal
          loginRecords={isAdmin() ? allLogins : userLogins}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}

const getTodayLogins = (logins) => {
  const today = new Date().toDateString()
  return logins.filter(login => new Date(login.timestamp).toDateString() === today).length
}

const getLastLoginTime = (logins) => {
  if (logins.length === 0) return 'N/A'
  const lastLogin = logins[logins.length - 1]
  return new Date(lastLogin.timestamp).toLocaleString()
}

const getMemberSince = (user) => {
  if (!user?.createdAt) return 'N/A'
  return new Date(user.createdAt).toLocaleDateString()
}

export default Dashboard

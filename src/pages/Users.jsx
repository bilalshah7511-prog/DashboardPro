import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { userAPI } from '../services/api'
import socketService from '../services/socket'
import EditUserModal from '../components/organisms/EditUserModal'
import AddUserModal from '../components/organisms/AddUserModal'
import { TableSkeleton, EmptyState } from '../skeletons'
import { FaEdit, FaTrash, FaUserPlus, FaSearch, FaImage } from 'react-icons/fa'

const Users = () => {
  const { user: currentUser } = useAuth()
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()

    // Setup WebSocket listeners
    socketService.onNewUser(() => {
      fetchUsers()
    })

    socketService.onUserListUpdated(() => {
      fetchUsers()
    })

    return () => {
      socketService.off('new_user')
      socketService.off('user_list_updated')
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll()
      setUsers(response.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert('You cannot delete your own account!')
      return
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(id)
        socketService.emitUserDeleted(id)
        fetchUsers()
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user')
      }
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleImageUpload = async (userId, e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          await userAPI.updateUser(userId, { profile_image: reader.result })
          socketService.emitProfileUpdated(userId, { profile_image: reader.result })
          fetchUsers()
        } catch (error) {
          alert('Failed to update profile image')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('userManagement')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all registered users and track their activity</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4 transition-colors">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">{t('admin')}</option>
              <option value="user">{t('user')}</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <FaUserPlus />
              <span>{t('addUser')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {loading ? 'All Users' : `All Users (${filteredUsers.length || 0})`}
          </h2>
        </div>

        {/* Loading Skeleton */}
        {loading && <TableSkeleton rows={5} columns={5} />}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <EmptyState 
            icon="folder"
            title="No users found"
            description={searchTerm ? 'No users match your search criteria.' : 'There are no users to display.'}
          />
        )}

        {/* Users Table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('loginCount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('lastLogin')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative group">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                            <FaImage className="text-white text-sm" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(user.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.gender || 'Not specified'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {user.login_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4 inline-flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser.id}
                        className={`inline-flex items-center ${
                          user.id === currentUser.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                        }`}
                      >
                        <FaTrash className="mr-1" />
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
          }}
          onSave={() => {
            fetchUsers()
            setShowEditModal(false)
            setEditingUser(null)
          }}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={() => {
            fetchUsers()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

export default Users

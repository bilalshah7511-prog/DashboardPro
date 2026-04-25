import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsers, deleteUser, updateUser, getLoginRecords } from '../utils/storage'
import EditUserModal from '../components/EditUserModal'
import AddUserModal from '../components/AddUserModal'
import { FaEdit, FaTrash, FaUserPlus, FaSearch, FaImage } from 'react-icons/fa'

const Users = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState(getUsers())
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [editingImageUser, setEditingImageUser] = useState(null)
  const loginRecords = getLoginRecords()

  const handleDelete = (id) => {
    if (id === currentUser.id) {
      alert('You cannot delete your own account!')
      return
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id)
      setUsers(getUsers())
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleSave = (id, updatedData) => {
    const result = updateUser(id, updatedData)
    if (result.success) {
      setUsers(getUsers())
      setShowEditModal(false)
      setEditingUser(null)
    }
  }

  const handleImageUpload = (userId, e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        updateUser(userId, { profileImage: reader.result })
        setUsers(getUsers())
      }
      reader.readAsDataURL(file)
    }
  }

  const getUserLastLogin = (userId) => {
    const userLogins = loginRecords.filter(r => r.userId === userId)
    if (userLogins.length === 0) return 'Never'
    const lastLogin = userLogins[userLogins.length - 1]
    return new Date(lastLogin.timestamp).toLocaleString()
  }

  const getUserLoginCount = (userId) => {
    return loginRecords.filter(r => r.userId === userId).length
  }

  const filteredUsers = users.filter(user => {
    // Hide the main owner admin (admin@gmail.com) from the list only if current user is not owner
    if (user.email === 'admin@gmail.com' && currentUser.email !== 'admin@gmail.com') {
      return false
    }

    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all registered users and track their activity</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <FaUserPlus />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            All Users ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative group">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
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
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.gender || 'Not specified'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUserLoginCount(user.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getUserLastLogin(user.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser.id}
                        className={`inline-flex items-center ${
                          user.id === currentUser.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        <FaTrash className="mr-1" />
                        Delete
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
          onSave={handleSave}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={() => setUsers(getUsers())}
        />
      )}
    </div>
  )
}

export default Users

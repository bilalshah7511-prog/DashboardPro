import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUser } from '../utils/storage'
import { MdClose, MdCameraAlt } from 'react-icons/md'

const EditProfileModal = ({ onClose }) => {
  const { user, isAdmin, login } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    gender: user?.gender || 'Not specified',
    profileImage: user?.profileImage || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        setLoading(false)
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (formData.currentPassword !== user.password) {
        setError('Current password is incorrect')
        setLoading(false)
        return
      }
    }

    const updateData = {
      name: formData.name,
      gender: formData.gender,
      profileImage: formData.profileImage
    }

    if (isAdmin()) {
      updateData.email = formData.email
    }

    if (formData.newPassword) {
      updateData.password = formData.newPassword
    }

    const result = updateUser(user.id, updateData)

    if (result.success) {
      login(result.user)
      setSuccess('Profile updated successfully!')
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="flex flex-col items-center">
            <div className="relative">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-medium border-4 border-blue-100">
                  {formData.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <MdCameraAlt className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Click camera icon to upload image (max 2MB)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="Not specified">Not specified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address {!isAdmin() && <span className="text-xs text-gray-500">(Cannot be changed)</span>}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isAdmin()}
              required
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                !isAdmin() ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password (Optional)</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="New password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal

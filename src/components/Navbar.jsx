import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { HiMenu } from 'react-icons/hi'
import { FaUser, FaEnvelope, FaShieldAlt, FaEdit, FaChevronDown } from 'react-icons/fa'

const Navbar = ({ setSidebarOpen, onEditProfile }) => {
  const { user } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <HiMenu className="w-6 h-6" />
      </button>

      <div className="flex-1 lg:flex-none"></div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <FaChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <FaUser className="text-gray-400" />
                  <span className="font-medium">ID:</span>
                  <span className="text-gray-800">{user?.id}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <FaEnvelope className="text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-800 truncate">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <FaShieldAlt className="text-gray-400" />
                  <span className="font-medium">Role:</span>
                  <span className="text-gray-800 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="px-2 py-2">
              <button
                onClick={() => {
                  setShowDropdown(false)
                  onEditProfile()
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                <FaEdit className="text-lg" />
                <span className="font-medium">Edit Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar

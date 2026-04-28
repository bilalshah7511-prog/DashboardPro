import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { HiMenu } from 'react-icons/hi'
import { FaUser, FaEnvelope, FaShieldAlt, FaEdit, FaChevronDown, FaMoon, FaSun, FaGlobe } from 'react-icons/fa'

const Navbar = ({ setSidebarOpen, onEditProfile }) => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const dropdownRef = useRef(null)
  const langMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowLangMenu(false)
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 transition-colors">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
      >
        <HiMenu className="w-6 h-6" />
      </button>

      <div className="flex-1 lg:flex-none"></div>

      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Change Language"
          >
            <FaGlobe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                    i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <FaSun className="w-5 h-5 text-yellow-400" />
          ) : (
            <FaMoon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <FaChevronDown className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <FaUser className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">ID:</span>
                    <span className="text-gray-800 dark:text-gray-300">{user?.id}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span className="text-gray-800 dark:text-gray-300 truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <FaShieldAlt className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">Role:</span>
                    <span className="text-gray-800 dark:text-gray-300 capitalize">{user?.role}</span>
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
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg transition"
                >
                  <FaEdit className="text-lg" />
                  <span className="font-medium">{t('editProfile')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar

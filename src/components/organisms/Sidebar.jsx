import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { MdDashboard, MdPeople, MdAnalytics, MdLogout, MdPhotoLibrary, MdArticle } from 'react-icons/md'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin, logout } = useAuth()
  const { t } = useTranslation()

  const menuItems = [
    { name: t('dashboard'), path: '/dashboard', icon: MdDashboard },
    ...(isAdmin() ? [
      { name: t('users'), path: '/users', icon: MdPeople },
      { name: t('profiles'), path: '/gallery', icon: MdPhotoLibrary },
      { name: t('blogManagement'), path: '/admin/blogs', icon: MdArticle }
    ] : []),
    { name: t('blogs'), path: '/blogs', icon: MdArticle },
    { name: t('analytics'), path: '/analytics', icon: MdAnalytics }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">DashPro</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    location.pathname === item.path
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="text-xl mr-3" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition"
            >
              <MdLogout className="text-xl mr-3" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

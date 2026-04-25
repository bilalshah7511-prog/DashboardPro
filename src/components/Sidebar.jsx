import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MdDashboard, MdPeople, MdAnalytics, MdLogout, MdPhotoLibrary } from 'react-icons/md'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin, logout } = useAuth()

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
    ...(isAdmin() ? [
      { name: 'Users', path: '/users', icon: MdPeople },
      { name: 'Profiles', path: '/gallery', icon: MdPhotoLibrary }
    ] : []),
    { name: 'Analytics', path: '/analytics', icon: MdAnalytics }
  ]

  const handleLogout = () => {
    logout()
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
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-blue-600">DashPro</h1>
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
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-xl mr-3" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
            >
              <MdLogout className="text-xl mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

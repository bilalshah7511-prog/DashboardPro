import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import EditProfileModal from './EditProfileModal'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar setSidebarOpen={setSidebarOpen} onEditProfile={() => setShowEditModal(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </div>
  )
}

export default DashboardLayout

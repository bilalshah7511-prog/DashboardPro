// ============================================
// ATOMIC DESIGN COMPONENT EXPORTS
// ============================================

// ----- ATOMS (Basic Building Blocks) -----
export { default as StatsCard } from './atoms/StatsCard'

// ----- MOLECULES (Simple Component Groups) -----
export { default as ConfirmModal } from './molecules/ConfirmModal'

// ----- ORGANISMS (Complex Components) -----
// Layout
export { default as Navbar } from './organisms/Navbar'
export { default as Sidebar } from './organisms/Sidebar'
export { default as DashboardLayout } from './organisms/DashboardLayout'

// Modals
export { default as AddUserModal } from './organisms/AddUserModal'
export { default as EditUserModal } from './organisms/EditUserModal'
export { default as CreateBlogModal } from './organisms/CreateBlogModal'
export { default as EditBlogModal } from './organisms/EditBlogModal'
export { default as EditProfileModal } from './organisms/EditProfileModal'
export { default as LoginDetailsModal } from './organisms/LoginDetailsModal'

// Re-export category indexes for granular imports
export * from './atoms'
export * from './molecules'
export * from './organisms'

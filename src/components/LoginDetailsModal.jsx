import { useState } from 'react'
import { MdClose } from 'react-icons/md'
import { FaSearch, FaFilter, FaClock, FaTimes } from 'react-icons/fa'
import { getUsers } from '../utils/storage'

const LoginDetailsModal = ({ loginRecords, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const users = getUsers()

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'Unknown User'
  }

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.email : 'N/A'
  }

  const filterByDate = (record) => {
    const recordDate = new Date(record.timestamp)

    // Custom date range filter
    if (filterDate === 'custom') {
      if (!startDateTime && !endDateTime) return true

      const start = startDateTime ? new Date(startDateTime) : null
      const end = endDateTime ? new Date(endDateTime) : null

      if (start && end) {
        return recordDate >= start && recordDate <= end
      } else if (start) {
        return recordDate >= start
      } else if (end) {
        return recordDate <= end
      }
      return true
    }

    // Predefined filters
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    switch(filterDate) {
      case 'today':
        return recordDate.toDateString() === today.toDateString()
      case 'yesterday':
        return recordDate.toDateString() === yesterday.toDateString()
      case 'week':
        return recordDate >= lastWeek
      case 'month':
        return recordDate >= lastMonth
      default:
        return true
    }
  }

  const filteredRecords = loginRecords
    .filter(record => {
      const userName = getUserName(record.userId).toLowerCase()
      const userEmail = getUserEmail(record.userId).toLowerCase()
      const matchesSearch = userName.includes(searchTerm.toLowerCase()) ||
                           userEmail.includes(searchTerm.toLowerCase())
      return matchesSearch && filterByDate(record)
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp)
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp)
      }
    })

  const handleFilterChange = (value) => {
    setFilterDate(value)
    if (value === 'custom') {
      setShowCustomRange(true)
    } else {
      setShowCustomRange(false)
      setStartDateTime('')
      setEndDateTime('')
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterDate('all')
    setSortBy('newest')
    setShowCustomRange(false)
    setStartDateTime('')
    setEndDateTime('')
  }

  const hasActiveFilters = searchTerm || filterDate !== 'all' || sortBy !== 'newest'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Login Details</h2>
            <p className="text-sm text-gray-500 mt-1">Total {filteredRecords.length} login records</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-4">
            {/* First Row: Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by user name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex gap-3">
                <select
                  value={filterDate}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                    title="Clear all filters"
                  >
                    <FaTimes />
                    <span className="hidden lg:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Custom Date Range */}
            {showCustomRange && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaClock className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-800">Custom Date & Time Range</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Example: Select 02/25/2026 2:00 PM to 02/25/2026 3:00 PM to filter logins in that hour
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No login records found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getUserName(record.userId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getUserEmail(record.userId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginDetailsModal

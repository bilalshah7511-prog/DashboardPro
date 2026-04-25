import { useAuth } from '../context/AuthContext'
import { getUsers, getLoginRecords, getUserLoginRecords } from '../utils/storage'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Analytics = () => {
  const { user, isAdmin } = useAuth()
  const loginRecords = isAdmin() ? getLoginRecords() : getUserLoginRecords(user?.id)
  const users = getUsers()

  const dailyData = getDailyLoginData(loginRecords)
  const monthlyData = getMonthlyLoginData(loginRecords)
  const userActivityData = isAdmin() ? getUserActivityData(users, getLoginRecords()) : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600 mt-1">
          {isAdmin() ? 'Overview of all user activity' : 'Your login activity'}
        </p>
      </div>

      {loginRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No login data available yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Login Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Login Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {isAdmin() && userActivityData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">User Activity Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="logins" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Login History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    {isAdmin() && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loginRecords.slice(-10).reverse().map((record) => {
                    const recordUser = users.find(u => u.id === record.userId)
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.timestamp).toLocaleString()}
                        </td>
                        {isAdmin() && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {recordUser?.name || 'Unknown'}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Success
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const getDailyLoginData = (records) => {
  const dailyMap = {}

  records.forEach(record => {
    const date = new Date(record.timestamp).toLocaleDateString()
    dailyMap[date] = (dailyMap[date] || 0) + 1
  })

  return Object.entries(dailyMap)
    .map(([date, logins]) => ({ date, logins }))
    .slice(-7)
}

const getMonthlyLoginData = (records) => {
  const monthlyMap = {}

  records.forEach(record => {
    const date = new Date(record.timestamp)
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' })
    monthlyMap[month] = (monthlyMap[month] || 0) + 1
  })

  return Object.entries(monthlyMap)
    .map(([month, logins]) => ({ month, logins }))
    .slice(-6)
}

const getUserActivityData = (users, records) => {
  return users
    .map(user => {
      const userLogins = records.filter(r => r.userId === user.id)
      return {
        name: user.name,
        logins: userLogins.length
      }
    }).filter(data => data.logins > 0)
}

export default Analytics

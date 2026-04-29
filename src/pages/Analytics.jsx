import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { userAPI } from '../services/api'
import { EmptyState } from '../skeletons'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Analytics = () => {
  const { user, isAdmin } = useAuth()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [loginRecords, setLoginRecords] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const isDark = theme === 'dark'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (isAdmin()) {
        const [usersRes, recordsRes] = await Promise.all([
          userAPI.getAll(),
          userAPI.getLoginRecords()
        ])
        setUsers(usersRes.data.users)
        setLoginRecords(recordsRes.data.loginRecords)
      } else {
        // Regular user - backend will filter by req.user.id automatically
        const recordsRes = await userAPI.getLoginRecords()
        setLoginRecords(recordsRes.data.loginRecords)
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const dailyData = getDailyLoginData(loginRecords)
  const monthlyData = getMonthlyLoginData(loginRecords)
  const userActivityData = isAdmin() ? getUserActivityData(users, loginRecords) : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('analytics')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isAdmin() ? t('allUserActivity') : t('yourLoginActivity')}
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          {/* Chart Skeletons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && loginRecords.length === 0 && (
        <EmptyState 
          icon="folder"
          title={t('noData')}
          description={t('noData')}
        />
      )}

      {/* Analytics Content */}
      {!loading && loginRecords.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('dailyLoginActivity')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    color: isDark ? '#f3f4f6' : '#111827'
                  }}
                />
                <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
                <Line type="monotone" dataKey="logins" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('monthlyLoginTrends')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    color: isDark ? '#f3f4f6' : '#111827'
                  }}
                />
                <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
                <Bar dataKey="logins" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {isAdmin() && userActivityData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('userActivityOverview')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      color: isDark ? '#f3f4f6' : '#111827'
                    }}
                  />
                  <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
                  <Bar dataKey="logins" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('recentLoginHistory')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('dateAndTime')}
                    </th>
                    {isAdmin() && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('name')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('email')}
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('ipAddress')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loginRecords.slice(-10).reverse().map((record) => {
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {new Date(record.login_time).toLocaleString()}
                        </td>
                        {isAdmin() && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                              {record.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {record.email || 'N/A'}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {record.ip_address || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
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
    const date = new Date(record.login_time).toLocaleDateString()
    dailyMap[date] = (dailyMap[date] || 0) + 1
  })

  return Object.entries(dailyMap)
    .map(([date, logins]) => ({ date, logins }))
    .slice(-7)
}

const getMonthlyLoginData = (records) => {
  const monthlyMap = {}

  records.forEach(record => {
    const date = new Date(record.login_time)
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

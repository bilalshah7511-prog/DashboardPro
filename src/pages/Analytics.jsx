import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { userAPI, blogAPI } from '../services/api'
import { EmptyState } from '../skeletons'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MdFavorite, MdVisibility, MdChat } from 'react-icons/md'

const Analytics = () => {
  const { user, isAdmin } = useAuth()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [loginRecords, setLoginRecords] = useState([])
  const [users, setUsers] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [trendingBlog, setTrendingBlog] = useState(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      if (isAdmin()) {
        const [usersRes, recordsRes, blogsRes] = await Promise.all([
          userAPI.getAll(),
          userAPI.getLoginRecords(),
          blogAPI.getAllBlogsAdmin('all')
        ])
        setUsers(usersRes.data?.users || [])
        setLoginRecords(recordsRes.data?.loginRecords || [])
        setBlogs(blogsRes.data?.blogs || [])
      } else {
        // Regular user - backend will filter by req.user.id automatically
        const [recordsRes, myBlogsRes] = await Promise.all([
          userAPI.getLoginRecords(),
          blogAPI.getMyBlogs()
        ])
        setLoginRecords(recordsRes.data?.loginRecords || [])
        setBlogs(myBlogsRes.data?.blogs || [])
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      setError(error.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Safely compute data with fallback to empty arrays
  const dailyData = loginRecords?.length ? getDailyLoginData(loginRecords) : []
  const monthlyData = loginRecords?.length ? getMonthlyLoginData(loginRecords) : []
  const userActivityData = isAdmin() && users?.length ? getUserActivityData(users, loginRecords) : []
  const blogMonthlyData = blogs?.length ? getMonthlyBlogData(blogs, dateFilter) : []
  const blogStats = blogs?.length ? getBlogStats(blogs, dateFilter) : { published: 0, rejected: 0, pending: 0, totalViews: 0 }
  const trendingBlogsList = blogs?.length ? getTrendingBlogs(blogs) : []

  return (
    <div>
      {/* Tabs Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('analytics')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isAdmin() ? t('allUserActivity') : t('yourLoginActivity')}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className={`rounded-lg shadow p-6 mb-6 ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-800'}`}>Error Loading Data</h3>
              <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

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
      {!loading && !error && loginRecords.length === 0 && (
        <EmptyState 
          icon="folder"
          title={t('noData') || 'No Data Available'}
          description={t('noAnalyticsDataYet') || 'No analytics data available yet. Start using the application to generate data.'}
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

          {/* Blog Analytics Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {isAdmin() ? t('Blog Analytics Overview') : t('Your Blog Analytics')}
              </h2>
              {isAdmin() && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>

            {/* Blog Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Published Blogs')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{blogStats.published}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Rejected Blogs')}</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{blogStats.rejected}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Pending Blogs')}</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{blogStats.pending}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Total Views')}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{blogStats.totalViews}</p>
              </div>
            </div>

            {/* Monthly Blog Creation Chart */}
            {blogMonthlyData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">{t('Monthly Blog Creation')}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={blogMonthlyData}>
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
                    <Bar dataKey="published" fill="#10B981" name={t('published')} />
                    <Bar dataKey="rejected" fill="#EF4444" name={t('rejected')} />
                    <Bar dataKey="pending" fill="#F59E0B" name={t('pending')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trending Blogs */}
            {trendingBlogsList.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">{t('Trending Blogs')}</h3>
                <div className="space-y-3">
                  {trendingBlogsList.slice(0, 5).map((blog, index) => (
                    <div key={blog.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                          {index + 1}
                        </span>
                        {blog.author_image ? (
                          <img src={blog.author_image} alt={blog.author_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                            {blog.author_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link to={`/blogs/${blog.id}`} className="font-medium text-gray-800 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {blog.title}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{blog.author_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-pink-600">
                          <MdFavorite className="w-4 h-4" />
                          {blog.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <MdVisibility className="w-4 h-4" />
                          {blog.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-purple-600">
                          <MdChat className="w-4 h-4" />
                          {blog.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
  if (!Array.isArray(records) || records.length === 0) return []
  const dailyMap = {}

  records.forEach(record => {
    if (!record?.login_time) return
    const date = new Date(record.login_time).toLocaleDateString()
    dailyMap[date] = (dailyMap[date] || 0) + 1
  })

  return Object.entries(dailyMap)
    .map(([date, logins]) => ({ date, logins }))
    .slice(-7)
}

const getMonthlyLoginData = (records) => {
  if (!Array.isArray(records) || records.length === 0) return []
  const monthlyMap = {}

  records.forEach(record => {
    if (!record?.login_time) return
    const date = new Date(record.login_time)
    const month = date.toLocaleString('default', { month: 'short', year: '2-digit' })
    monthlyMap[month] = (monthlyMap[month] || 0) + 1
  })

  return Object.entries(monthlyMap)
    .map(([month, logins]) => ({ month, logins }))
    .slice(-6)
}

const getUserActivityData = (users, records) => {
  if (!Array.isArray(users) || !Array.isArray(records)) return []
  const userLogins = {}
  
  records.forEach(record => {
    if (!record?.user_id) return
    const userId = record.user_id
    userLogins[userId] = (userLogins[userId] || 0) + 1
  })

  return users.map(user => ({
    name: user.name?.split(' ')[0] || 'Unknown',
    logins: userLogins[user.id] || 0
  })).slice(0, 10)
}

const getMonthlyBlogData = (blogs, dateFilter) => {
  if (!Array.isArray(blogs)) return []
  const monthlyMap = {}
  
  blogs.forEach(blog => {
    if (!blog?.created_at) return
    const date = new Date(blog.created_at)
    if (dateFilter?.start && date < new Date(dateFilter.start)) return
    if (dateFilter?.end && date > new Date(dateFilter.end)) return
    
    const month = date.toLocaleString('default', { month: 'short', year: '2-digit' })
    if (!monthlyMap[month]) {
      monthlyMap[month] = { published: 0, rejected: 0, pending: 0 }
    }
    
    if (blog.status === 'approved') monthlyMap[month].published++
    else if (blog.status === 'rejected') monthlyMap[month].rejected++
    else if (blog.status === 'pending') monthlyMap[month].pending++
  })
  
  return Object.entries(monthlyMap)
    .map(([month, counts]) => ({ month, ...counts }))
    .slice(-6)
}

const getBlogStats = (blogs, dateFilter) => {
  if (!Array.isArray(blogs)) return { published: 0, rejected: 0, pending: 0, totalViews: 0 }
  const filtered = blogs.filter(blog => {
    if (!blog?.created_at) return false
    const date = new Date(blog.created_at)
    if (dateFilter?.start && date < new Date(dateFilter.start)) return false
    if (dateFilter?.end && date > new Date(dateFilter.end)) return false
    return true
  })
  
  return {
    published: filtered.filter(b => b.status === 'approved').length,
    rejected: filtered.filter(b => b.status === 'rejected').length,
    pending: filtered.filter(b => b.status === 'pending').length,
    totalViews: filtered.reduce((sum, b) => sum + (b.view_count || 0), 0)
  }
}

const getTrendingBlogs = (blogs) => {
  if (!Array.isArray(blogs)) return []
  return blogs
    .filter(b => b?.status === 'approved')
    .sort((a, b) => {
      const scoreA = (a?.view_count || 0) + (a?.likes_count || 0) * 2 + (a?.comments_count || 0) * 3
      const scoreB = (b?.view_count || 0) + (b?.likes_count || 0) * 2 + (b?.comments_count || 0) * 3
      return scoreB - scoreA
    })
}

export default Analytics

const StatsCard = ({ title, value, icon: Icon, color, onClick, clickable = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
  }

  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
        <Icon className="text-2xl" />
      </div>
    </div>
  )

  if (clickable && onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition w-full text-left cursor-pointer transform hover:scale-105"
      >
        <CardContent />
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition">
      <CardContent />
    </div>
  )
}

export default StatsCard

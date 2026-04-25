const StatsCard = ({ title, value, icon: Icon, color, onClick, clickable = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
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
        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition w-full text-left cursor-pointer transform hover:scale-105"
      >
        <CardContent />
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <CardContent />
    </div>
  )
}

export default StatsCard

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-xl" />
    </div>
  </div>
)

export const StatsSkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
)

export default StatCardSkeleton

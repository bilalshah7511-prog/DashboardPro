const NotificationSkeleton = () => {
  return (
    <div className="px-4 py-3 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          {/* Avatar Skeleton */}
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
          
          {/* Content Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name and Time */}
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
            </div>
            
            {/* Message */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationSkeleton

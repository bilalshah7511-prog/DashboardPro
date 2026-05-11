import { skeletonPulse } from './pulse'

function ChatTabInitialSkeleton({ isDark }) {
  const sk = (shape = 'rounded-lg') => skeletonPulse(isDark, shape)
  return (
    <div className="flex h-[calc(100vh-200px)] gap-4" aria-busy="true">
      <div className={`w-80 overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`border-b p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className={`h-5 w-36 ${sk()}`} />
            <div className={`h-9 w-9 ${sk('rounded-full')}`} />
          </div>
          <div className={`h-9 w-full ${sk()}`} />
        </div>
        <div className="space-y-2 p-2 pt-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2">
              <div className={`h-10 w-10 shrink-0 ${sk('rounded-full')}`} />
              <div className="min-w-0 flex-1 space-y-2">
                <div className={`h-3.5 w-[55%] ${sk('rounded-md')}`} />
                <div className={`h-2.5 w-[35%] ${sk('rounded-md')}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`flex flex-1 flex-col overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex h-16 items-center justify-between border-b px-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 ${sk('rounded-full')}`} />
            <div className="space-y-2">
              <div className={`h-4 w-32 ${sk('rounded-md')}`} />
              <div className={`h-2.5 w-20 ${sk('rounded-md')}`} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`h-9 w-9 ${sk('rounded-full')}`} />
            <div className={`h-9 w-9 ${sk('rounded-full')}`} />
          </div>
        </div>
        <div className={`flex flex-1 flex-col gap-3 p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`h-10 max-w-[260px] ${sk('rounded-2xl')}`}
                style={{ width: `${[72, 48, 64, 80, 44, 58, 52][i]}%` }}
              />
            </div>
          ))}
        </div>
        <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`h-11 w-full ${sk('rounded-full')}`} />
        </div>
      </div>
    </div>
  )
}

function FriendsTabInitialSkeleton({ isDark }) {
  const sk = (shape = 'rounded-lg') => skeletonPulse(isDark, shape)
  return (
    <div className={`overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`} aria-busy="true">
      <div className="p-4">
        <div className={`mb-4 h-6 w-48 ${sk()}`} />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 ${sk('rounded-full')}`} />
                <div className={`h-4 w-28 ${sk('rounded-md')}`} />
              </div>
              <div className="flex gap-2">
                <div className={`h-9 w-9 ${sk('rounded-full')}`} />
                <div className={`h-9 w-9 ${sk('rounded-full')}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`mb-4 h-6 w-40 ${sk()}`} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`space-y-3 rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 ${sk('rounded-full')}`} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className={`h-4 w-full ${sk('rounded-md')}`} />
                  <div className={`h-3 w-2/3 ${sk('rounded-md')}`} />
                </div>
              </div>
              <div className={`h-9 w-full ${sk()}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UsersTabInitialSkeleton({ isDark }) {
  const sk = (shape = 'rounded-lg') => skeletonPulse(isDark, shape)
  return (
    <div className={`overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`} aria-busy="true">
      <div className={`border-b p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`h-5 w-44 ${sk()}`} />
          <div className={`h-9 w-9 ${sk('rounded-lg')}`} />
        </div>
        <div className={`h-10 w-full ${sk()}`} />
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`space-y-3 rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 ${sk('rounded-full')}`} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className={`h-4 w-full ${sk('rounded-md')}`} />
                  <div className={`h-3 w-full ${sk('rounded-md')}`} />
                </div>
              </div>
              <div className={`h-9 w-full ${sk()}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BlockedTabInitialSkeleton({ isDark }) {
  const sk = (shape = 'rounded-lg') => skeletonPulse(isDark, shape)
  return (
    <div className={`overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`} aria-busy="true">
      <div className="p-4">
        <div className={`mb-4 h-6 w-52 ${sk()}`} />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 ${sk('rounded-full')}`} />
                <div className="space-y-2">
                  <div className={`h-4 w-32 ${sk('rounded-md')}`} />
                  <div className={`h-2.5 w-24 ${sk('rounded-md')}`} />
                </div>
              </div>
              <div className={`h-9 w-24 ${sk('rounded-lg')}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminTabInitialSkeleton({ isDark }) {
  const sk = (shape = 'rounded-lg') => skeletonPulse(isDark, shape)
  return (
    <div className="flex h-[calc(100vh-200px)] gap-4" aria-busy="true">
      <div className={`w-80 overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`border-b p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`h-5 w-40 ${sk()}`} />
        </div>
        <div className="space-y-2 p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`rounded-lg p-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className={`mb-2 h-3.5 w-full ${sk('rounded-md')}`} />
              <div className={`h-2.5 w-3/4 ${sk('rounded-md')}`} />
            </div>
          ))}
        </div>
      </div>
      <div className={`flex flex-1 flex-col overflow-hidden rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`h-14 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
        <div className={`flex flex-1 flex-col gap-3 p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-start">
              <div className={`h-12 w-[240px] max-w-[70%] ${sk('rounded-2xl rounded-bl-none')}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Full-page loading shell for Chat: title strip, tab bar pulses, and tab-shaped body.
 */
export function ChatPageLoadingView({ isDark, activeTab, isAdmin }) {
  const sk = (shape = 'rounded-lg') => skeletonPulse(isDark, shape)
  const tabBarSlots = isAdmin ? 5 : 4

  return (
    <div>
      <div className="mb-6">
        <div className={`mb-3 h-9 w-48 ${sk()}`} />
        <div className={`h-4 w-full max-w-2xl ${sk('rounded-md')}`} />
      </div>
      <div className={`mb-6 flex flex-wrap gap-1 rounded-lg p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {Array.from({ length: tabBarSlots }).map((_, i) => (
          <div key={i} className={`h-10 min-w-[7rem] flex-1 ${sk('rounded-lg')}`} />
        ))}
      </div>
      {activeTab === 'chat' && <ChatTabInitialSkeleton isDark={isDark} />}
      {activeTab === 'friends' && <FriendsTabInitialSkeleton isDark={isDark} />}
      {activeTab === 'users' && <UsersTabInitialSkeleton isDark={isDark} />}
      {activeTab === 'blocked' && <BlockedTabInitialSkeleton isDark={isDark} />}
      {activeTab === 'admin' && isAdmin && <AdminTabInitialSkeleton isDark={isDark} />}
    </div>
  )
}

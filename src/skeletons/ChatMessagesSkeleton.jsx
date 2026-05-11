import { skeletonPulse } from './pulse'

const widths = [55, 72, 45, 68, 52, 80, 44]

/** Alternating bubble rows while a DM conversation loads */
export function ChatDmThreadSkeleton({ isDark }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {widths.map((pct, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div
            className={`h-11 max-w-[280px] ${skeletonPulse(isDark, 'rounded-2xl')}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ))}
    </div>
  )
}

/** Left-aligned avatar + bubble rows while admin conversation loads */
export function ChatAdminThreadSkeleton({ isDark }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-start">
          <div className="flex max-w-[70%] items-end gap-2">
            <div className={`h-8 w-8 shrink-0 rounded-full ${skeletonPulse(isDark, 'rounded-full')}`} />
            <div
              className={`h-14 w-[220px] max-w-[70%] ${skeletonPulse(isDark, 'rounded-2xl rounded-bl-none')}`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

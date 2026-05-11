/** Tailwind pulse block for skeleton placeholders */
export function skeletonPulse(isDark, shape = 'rounded-lg') {
  return `animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${shape}`.trim()
}

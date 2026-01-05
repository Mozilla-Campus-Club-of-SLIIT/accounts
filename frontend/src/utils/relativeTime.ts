export const relativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (timestamp == 0) return "never"
  if (seconds < 10) return "now"
  if (seconds < 30) return "30 seconds ago"
  if (seconds < 60) return "1 minute ago"
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  return `${days} day${days > 1 ? "s" : ""} ago`
}

let totalRequests = 0
let todayRequests = 0
let lastResetDate = new Date().toDateString()

export function recordAiRequest() {
  const today = new Date().toDateString()
  if (today !== lastResetDate) {
    todayRequests = 0
    lastResetDate = today
  }
  totalRequests++
  todayRequests++
}

export function getAiStats() {
  return { total: totalRequests, today: todayRequests }
}

const API_BASE = 'http://localhost:5000/api/v1'

export function getToken() {
  try {
    const session = localStorage.getItem('transitops_session')
    return session ? JSON.parse(session).token : null
  } catch {
    return null
  }
}

export function getSession() {
  try {
    const session = localStorage.getItem('transitops_session')
    return session ? JSON.parse(session) : null
  } catch {
    return null
  }
}

export function saveSession(token, user) {
  localStorage.setItem('transitops_session', JSON.stringify({ token, user }))
}

export function clearSession() {
  localStorage.removeItem('transitops_session')
}

export async function authFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    clearSession()
    window.location.reload()
  }
  return res
}

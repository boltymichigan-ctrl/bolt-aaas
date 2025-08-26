import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('yourauth_token')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface DashboardData {
  stats: {
    totalUsers: number
    activeUsers: number
    totalLogins: number
    failedLogins: number
    usageCount: number
    quotaLimit: number
    plan: string
  }
  recentUsers: Array<{
    id: string
    email: string
    created_at: string
    status: string
  }>
  recentLogs: Array<{
    id: string
    event_type: string
    user_email: string
    ip_address: string
    created_at: string
  }>
  developer: {
    id: string
    email: string
    plan: string
    apiKey: string
    created_at: string
  }
}

export const dashboardService = {
  getDashboard: (): Promise<{ data: { data: DashboardData } }> =>
    api.get('/dev/dashboard'),
}
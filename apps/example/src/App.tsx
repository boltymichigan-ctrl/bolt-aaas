import React, { useState, useEffect } from 'react'
import { Shield, User, LogOut, AlertCircle, CheckCircle, Code, Eye, EyeOff } from 'lucide-react'

// Mock YourAuth SDK for demo purposes
interface AuthUser {
  id: string
  email: string
  created_at: string
}

interface AuthResponse {
  success: boolean
  data?: {
    user: AuthUser
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
  error?: string
  message?: string
}

interface YourAuthError extends Error {
  status?: number
  code?: string
}

class YourAuth {
  private apiKey: string
  private baseURL: string

  constructor(config: { apiKey: string; baseURL?: string }) {
    this.apiKey = config.apiKey
    this.baseURL = config.baseURL || 'http://localhost:5000/api'
  }

  async signup(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      const error = new Error(data.error || 'Signup failed') as YourAuthError
      error.status = response.status
      throw error
    }
    return data
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      const error = new Error(data.error || 'Login failed') as YourAuthError
      error.status = response.status
      throw error
    }
    return data
  }

  async logout(userId?: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({ userId }),
    })

    return await response.json()
  }

  async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseURL}/auth/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({ email }),
    })

    return await response.json()
  }

  getUser(token: string): AuthUser {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const payload = JSON.parse(jsonPayload)
      return {
        id: payload.sub,
        email: payload.email,
        created_at: new Date(payload.iat * 1000).toISOString(),
      }
    } catch (error) {
      throw new Error('Invalid JWT token')
    }
  }
}

// Initialize YourAuth SDK with demo API key
const auth = new YourAuth({
  apiKey: 'ya_demo_api_key_12345', // This would be your real API key
  baseURL: 'http://localhost:5000/api' // Point to local backend for demo
})

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true
  })
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showTokens, setShowTokens] = useState(false)

  // Check for stored tokens on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('yourauth_access_token')
    const storedRefresh = localStorage.getItem('yourauth_refresh_token')
    
    if (storedToken) {
      try {
        const user = auth.getUser(storedToken)
        setAuthState({
          user,
          accessToken: storedToken,
          refreshToken: storedRefresh,
          loading: false
        })
      } catch (error) {
        // Invalid token, remove from storage
        localStorage.removeItem('yourauth_access_token')
        localStorage.removeItem('yourauth_refresh_token')
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      let result
      
      if (activeTab === 'signup') {
        result = await auth.signup(formData.email, formData.password)
        setSuccess('Account created successfully!')
      } else {
        result = await auth.login(formData.email, formData.password)
        setSuccess('Login successful!')
      }

      if (result.success && result.data) {
        const { user, tokens } = result.data
        
        // Store tokens
        localStorage.setItem('yourauth_access_token', tokens.accessToken)
        localStorage.setItem('yourauth_refresh_token', tokens.refreshToken)
        
        // Update state
        setAuthState({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          loading: false
        })
        
        setFormData({ email: '', password: '' })
      }
    } catch (error) {
      const authError = error as YourAuthError
      setError(authError.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (authState.user) {
        await auth.logout(authState.user.id)
      }
      
      // Clear storage and state
      localStorage.removeItem('yourauth_access_token')
      localStorage.removeItem('yourauth_refresh_token')
      
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false
      })
      
      setSuccess('Logged out successfully!')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Please enter your email address')
      return
    }

    try {
      const result = await auth.resetPassword(formData.email)
      if (result.success) {
        setSuccess('Password reset instructions sent to your email!')
      }
    } catch (error) {
      const authError = error as YourAuthError
      setError(authError.message || 'Password reset failed')
    }
  }

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">YourAuth Example</h1>
                <p className="text-sm text-gray-500">SDK Integration Demo</p>
              </div>
            </div>
            
            {authState.user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{authState.user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!authState.user ? (
          /* Authentication Forms */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => {
                    setActiveTab('login')
                    setError('')
                    setSuccess('')
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'login'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setActiveTab('signup')
                    setError('')
                    setSuccess('')
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'signup'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Messages */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={activeTab === 'signup' ? 'Create a secure password' : 'Enter your password'}
                    required
                    minLength={activeTab === 'signup' ? 6 : 1}
                  />
                  {activeTab === 'signup' && (
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {submitting ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              {activeTab === 'login' && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handlePasswordReset}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>

            {/* Demo Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Demo Mode</p>
                  <p className="text-yellow-700 mt-1">
                    This is a demo integration. In a real app, you'd use your actual API key from the YourAuth dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated State */
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                  <p className="text-gray-600 mt-1">You're successfully authenticated with YourAuth.</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{authState.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono text-sm">{authState.user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(authState.user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Tokens */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">JWT Tokens</h3>
                <button
                  onClick={() => setShowTokens(!showTokens)}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-500"
                >
                  {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showTokens ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              
              {showTokens ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                    <textarea
                      value={authState.accessToken || ''}
                      readOnly
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Token</label>
                    <textarea
                      value={authState.refreshToken || 'Not available'}
                      readOnly
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Click "Show" to view JWT tokens (for development purposes)</p>
              )}
            </div>

            {/* SDK Usage */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Code className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">SDK Integration</h3>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`// How this demo works:
import { YourAuth } from 'yourauth-js'

const auth = new YourAuth({
  apiKey: 'your-api-key'
})

// User signup/login
const result = await auth.${activeTab}('${authState.user.email}', 'password')

// Store tokens
localStorage.setItem('token', result.data.tokens.accessToken)

// Get user info
const user = auth.getUser(accessToken)`}
                </pre>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Integration Complete!</p>
                  <p className="text-green-700 mt-1">
                    This user is now stored in your YourAuth dashboard. Check the Users section to see this user appear in your analytics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
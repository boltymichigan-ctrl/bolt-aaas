import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  id: string
  email: string
  plan: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'yourauth_token'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Try to get user data
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/dev/dashboard')
      if (response.data.success) {
        setUser(response.data.data.developer)
      }
    } catch (error) {
      // Token is invalid
      localStorage.removeItem(TOKEN_KEY)
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/dev/login', { email, password })
      
      if (response.data.success) {
        const { developer, tokens } = response.data.data
        const { accessToken } = tokens
        
        localStorage.setItem(TOKEN_KEY, accessToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        setUser(developer)
      } else {
        throw new Error(response.data.error || 'Login failed')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const signup = async (email: string, password: string) => {
    try {
      const response = await api.post('/dev/signup', { email, password })
      
      if (response.data.success) {
        const { developer, tokens } = response.data.data
        const { accessToken } = tokens
        
        localStorage.setItem(TOKEN_KEY, accessToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        setUser(developer)
      } else {
        throw new Error(response.data.error || 'Signup failed')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Signup failed')
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
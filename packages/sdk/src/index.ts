import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface YourAuthConfig {
  apiKey: string
  baseURL?: string
}

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export interface AuthResponse {
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

export interface YourAuthError extends Error {
  status?: number
  code?: string
}

export class YourAuth {
  private client: AxiosInstance
  private apiKey: string

  constructor(config: YourAuthConfig) {
    this.apiKey = config.apiKey
    
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.yourauth.dev',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const yourAuthError: YourAuthError = new Error(
          error.response?.data?.error || error.message || 'Authentication request failed'
        )
        yourAuthError.status = error.response?.status
        yourAuthError.code = error.response?.data?.code
        throw yourAuthError
      }
    )
  }

  /**
   * Sign up a new user
   */
  async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/signup', {
        email,
        password,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Sign in an existing user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/login', {
        email,
        password,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Sign out a user (logout)
   */
  async logout(userId?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.client.post('/auth/logout', {
        userId,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.client.post('/auth/reset', {
        email,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get user information from token
   */
  async getUser(token: string): Promise<AuthUser> {
    try {
      // Decode JWT token to get user info (basic implementation)
      const payload = this.decodeJWT(token)
      return {
        id: payload.sub,
        email: payload.email,
        created_at: new Date(payload.iat * 1000).toISOString(),
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Verify if a token is valid
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.getUser(token)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Set a new API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
    this.client.defaults.headers['X-API-Key'] = apiKey
  }

  /**
   * Get current API key
   */
  getApiKey(): string {
    return this.apiKey
  }

  /**
   * Set base URL for API requests
   */
  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL
  }

  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      throw new Error('Invalid JWT token')
    }
  }

  private handleError(error: any): YourAuthError {
    if (error instanceof Error && 'status' in error) {
      return error as YourAuthError
    }
    
    const yourAuthError: YourAuthError = new Error(
      error.message || 'An unexpected error occurred'
    )
    return yourAuthError
  }
}

// Export types for consumers
export type { YourAuthConfig, AuthUser, AuthResponse, YourAuthError }

// Default export
export default YourAuth
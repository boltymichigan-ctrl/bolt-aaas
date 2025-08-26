import { YourAuth } from './index'

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
    defaults: {
      headers: {},
      baseURL: '',
    },
  })),
}))

describe('YourAuth SDK', () => {
  let auth: YourAuth
  let mockAxios: any

  beforeEach(() => {
    const axios = require('axios')
    mockAxios = axios.create()
    auth = new YourAuth({ apiKey: 'test-api-key' })
  })

  describe('initialization', () => {
    it('should create instance with API key', () => {
      expect(auth.getApiKey()).toBe('test-api-key')
    })

    it('should use custom base URL', () => {
      const customAuth = new YourAuth({
        apiKey: 'test-key',
        baseURL: 'https://custom.api.com',
      })
      expect(customAuth).toBeDefined()
    })
  })

  describe('signup', () => {
    it('should make signup request', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '123', email: 'test@example.com', created_at: new Date().toISOString() },
            tokens: { accessToken: 'token', refreshToken: 'refresh' },
          },
        },
      }
      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await auth.signup('test@example.com', 'password')

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@example.com',
        password: 'password',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle signup errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('User already exists'))

      await expect(auth.signup('test@example.com', 'password')).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should make login request', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '123', email: 'test@example.com', created_at: new Date().toISOString() },
            tokens: { accessToken: 'token', refreshToken: 'refresh' },
          },
        },
      }
      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await auth.login('test@example.com', 'password')

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('logout', () => {
    it('should make logout request', async () => {
      const mockResponse = {
        data: { success: true, message: 'Logout successful' },
      }
      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await auth.logout('user123')

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/logout', {
        userId: 'user123',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('resetPassword', () => {
    it('should make password reset request', async () => {
      const mockResponse = {
        data: { success: true, message: 'Reset email sent' },
      }
      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await auth.resetPassword('test@example.com')

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/reset', {
        email: 'test@example.com',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getUser', () => {
    it('should decode JWT token and return user info', () => {
      // Create a mock JWT token (header.payload.signature)
      const payload = {
        sub: 'user123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
      }
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`

      const user = auth.getUser(mockToken)

      expect(user.id).toBe('user123')
      expect(user.email).toBe('test@example.com')
    })
  })

  describe('API key management', () => {
    it('should update API key', () => {
      auth.setApiKey('new-api-key')
      expect(auth.getApiKey()).toBe('new-api-key')
    })
  })
})
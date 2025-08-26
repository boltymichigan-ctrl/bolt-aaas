# YourAuth Example App

A complete example integration showing how to use the YourAuth SDK in a React application.

## Overview

This example demonstrates:
- User signup and login flows
- Token management and storage
- Error handling and user feedback
- JWT token display and verification
- Real-world integration patterns

## Features

- **Authentication Forms**: Login and signup with validation
- **Token Management**: Secure storage and automatic retrieval
- **User Dashboard**: Display authenticated user information
- **JWT Token Viewer**: Inspect access and refresh tokens
- **Error Handling**: Comprehensive error display and recovery
- **Responsive Design**: Works on all device sizes

## Quick Start

### Prerequisites

- Node.js 18+
- YourAuth backend running on `localhost:5000`
- Valid API key from YourAuth dashboard

### Installation

```bash
cd apps/example
npm install
```

### Configuration

Update the API key in `src/App.tsx`:

```typescript
const auth = new YourAuth({
  apiKey: 'your-actual-api-key', // Replace with your API key
  baseURL: 'http://localhost:5000/api'
})
```

### Development

```bash
# Start the example app
npm run dev

# Open http://localhost:5175
```

## Project Structure

```
apps/example/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind CSS styles
├── public/                  # Static assets
├── index.html               # HTML template
└── package.json             # Dependencies and scripts
```

## Implementation Details

### SDK Initialization

```typescript
import { YourAuth, AuthUser, YourAuthError } from 'yourauth-js'

// Initialize the SDK
const auth = new YourAuth({
  apiKey: 'ya_demo_api_key_12345',
  baseURL: 'http://localhost:5000/api'
})
```

### Authentication State Management

```typescript
interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
}

const [authState, setAuthState] = useState<AuthState>({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true
})
```

### Token Persistence

```typescript
// Store tokens in localStorage
const storeTokens = (tokens: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem('yourauth_access_token', tokens.accessToken)
  localStorage.setItem('yourauth_refresh_token', tokens.refreshToken)
}

// Retrieve tokens on app load
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
      // Invalid token, clear storage
      localStorage.removeItem('yourauth_access_token')
      localStorage.removeItem('yourauth_refresh_token')
    }
  }
}, [])
```

### Form Handling

```typescript
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
      storeTokens(tokens)
      
      // Update state
      setAuthState({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        loading: false
      })
    }
  } catch (error) {
    const authError = error as YourAuthError
    setError(authError.message || 'An error occurred')
  } finally {
    setSubmitting(false)
  }
}
```

### Error Handling

```typescript
// Comprehensive error handling with user-friendly messages
const handleError = (error: YourAuthError) => {
  switch (error.status) {
    case 400:
      return 'Please check your email and password format'
    case 401:
      return 'Invalid email or password'
    case 429:
      return 'Too many attempts. Please try again later'
    case 500:
      return 'Service temporarily unavailable'
    default:
      return error.message || 'Something went wrong'
  }
}
```

### Logout Implementation

```typescript
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
```

## UI Components

### Authentication Forms

The example includes tabbed authentication forms with:
- Email and password validation
- Loading states during submission
- Success and error message display
- Password strength indicators (signup)
- Forgot password functionality

### User Dashboard

Once authenticated, users see:
- Welcome message with user information
- User details (email, ID, creation date)
- JWT token viewer (toggleable)
- SDK integration code example
- Success confirmation

### Token Viewer

```typescript
const [showTokens, setShowTokens] = useState(false)

// Toggle token visibility
<button onClick={() => setShowTokens(!showTokens)}>
  {showTokens ? <EyeOff /> : <Eye />}
  {showTokens ? 'Hide' : 'Show'} Tokens
</button>

{showTokens && (
  <div>
    <textarea value={authState.accessToken} readOnly />
    <textarea value={authState.refreshToken} readOnly />
  </div>
)}
```

## Integration Patterns

### React Hook Pattern

```typescript
// Custom hook for YourAuth
const useYourAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async (email: string, password: string) => {
    const result = await auth.login(email, password)
    if (result.success && result.data) {
      setUser(result.data.user)
      storeTokens(result.data.tokens)
    }
  }

  const logout = async () => {
    if (user) {
      await auth.logout(user.id)
    }
    setUser(null)
    clearTokens()
  }

  return { user, loading, login, logout }
}
```

### Context Provider Pattern

```typescript
// Authentication context
const AuthContext = createContext<{
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Implementation here
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Protected Route Pattern

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  
  return <>{children}</>
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Testing the Integration

### Manual Testing Steps

1. **Signup Flow:**
   - Enter valid email and password
   - Verify account creation success
   - Check user appears in YourAuth dashboard
   - Confirm tokens are stored

2. **Login Flow:**
   - Use created credentials to login
   - Verify successful authentication
   - Check user information display
   - Confirm token refresh

3. **Error Handling:**
   - Try invalid credentials
   - Test network failures
   - Verify error messages
   - Check recovery flows

4. **Token Management:**
   - Refresh page to test persistence
   - Check token expiration handling
   - Verify logout clears tokens

### Automated Testing

```typescript
// Example test with Jest and React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

test('user can sign up successfully', async () => {
  render(<App />)
  
  // Switch to signup tab
  fireEvent.click(screen.getByText('Sign Up'))
  
  // Fill form
  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'test@example.com' }
  })
  fireEvent.change(screen.getByPlaceholderText('Create a secure password'), {
    target: { value: 'password123' }
  })
  
  // Submit form
  fireEvent.click(screen.getByText('Create Account'))
  
  // Wait for success
  await waitFor(() => {
    expect(screen.getByText('Account created successfully!')).toBeInTheDocument()
  })
})
```

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

```bash
# .env.production
VITE_YOURAUTH_API_KEY=ya_your_production_key
VITE_API_URL=https://api.yourauth.dev
```

### Hosting Options

- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Drag and drop `dist` folder
- **GitHub Pages**: Use `gh-pages` package
- **Custom Server**: Serve `dist` folder with any web server

## Security Considerations

### API Key Security

```typescript
// ❌ Never expose API keys in client code
const auth = new YourAuth({ apiKey: 'ya_secret_key' })

// ✅ Use environment variables
const auth = new YourAuth({ 
  apiKey: import.meta.env.VITE_YOURAUTH_API_KEY 
})
```

### Token Storage

```typescript
// Consider using secure storage for sensitive apps
const secureStorage = {
  setItem: (key: string, value: string) => {
    // Use encrypted storage or secure cookies
    localStorage.setItem(key, btoa(value)) // Basic encoding
  },
  getItem: (key: string) => {
    const value = localStorage.getItem(key)
    return value ? atob(value) : null
  }
}
```

### Input Validation

```typescript
// Client-side validation (server validates too)
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validatePassword = (password: string) => {
  return password.length >= 6
}
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```
   Error: Network Error
   ```
   - Check backend server is running
   - Verify API URL is correct
   - Check CORS configuration

2. **Invalid API Key**
   ```
   Error: Invalid API key
   ```
   - Verify API key is correct
   - Check environment variable name
   - Ensure key starts with 'ya_'

3. **Token Expired**
   ```
   Error: Token expired
   ```
   - Implement token refresh logic
   - Clear expired tokens from storage
   - Redirect to login page

### Debug Mode

```typescript
// Enable debug logging
const auth = new YourAuth({
  apiKey: 'your-key',
  baseURL: 'http://localhost:5000/api',
  debug: true // Add debug flag if supported
})
```

## Next Steps

After running this example:

1. **Customize the UI** to match your brand
2. **Add more features** like profile management
3. **Implement token refresh** for production use
4. **Add form validation** and better error handling
5. **Set up monitoring** and analytics
6. **Deploy to production** with proper environment variables

## Support

- **Example Issues**: [GitHub Issues](https://github.com/yourauth/yourauth/issues)
- **SDK Documentation**: [SDK Docs](../packages/sdk/README.md)
- **API Reference**: [Backend Docs](../backend/README.md)
- **Email Support**: example-support@yourauth.dev

## License

MIT License - see [LICENSE](../../LICENSE) for details.
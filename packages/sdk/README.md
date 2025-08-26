# YourAuth JavaScript SDK

The official JavaScript/TypeScript SDK for YourAuth authentication service.

## Installation

```bash
npm install yourauth-js
```

## Quick Start

```javascript
import { YourAuth } from 'yourauth-js'

const auth = new YourAuth({
  apiKey: 'your-api-key' // Get this from your YourAuth dashboard
})

// Sign up a new user
try {
  const result = await auth.signup('user@example.com', 'password')
  console.log('User created:', result.data.user)
  
  // Store the tokens
  localStorage.setItem('accessToken', result.data.tokens.accessToken)
  localStorage.setItem('refreshToken', result.data.tokens.refreshToken)
} catch (error) {
  console.error('Signup failed:', error.message)
}
```

## Configuration

### Initialize with Options

```javascript
const auth = new YourAuth({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yourauth.dev' // Optional, defaults to production URL
})
```

### Environment Variables

For security, store your API key in environment variables:

```javascript
const auth = new YourAuth({
  apiKey: process.env.YOURAUTH_API_KEY
})
```

## API Reference

### `signup(email, password)`

Register a new user account.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password (minimum 6 characters)

**Returns:** Promise<AuthResponse>

```javascript
const result = await auth.signup('user@example.com', 'securepassword')
```

### `login(email, password)`

Authenticate an existing user.

**Parameters:**
- `email` (string): User's email address  
- `password` (string): User's password

**Returns:** Promise<AuthResponse>

```javascript
const result = await auth.login('user@example.com', 'securepassword')
```

### `logout(userId?)`

Sign out a user (for logging purposes).

**Parameters:**
- `userId` (string, optional): User ID to log out

**Returns:** Promise<{success: boolean, message?: string}>

```javascript
await auth.logout('user-id-123')
```

### `resetPassword(email)`

Request a password reset email.

**Parameters:**
- `email` (string): User's email address

**Returns:** Promise<{success: boolean, message?: string}>

```javascript
await auth.resetPassword('user@example.com')
```

### `getUser(token)`

Decode a JWT token and get user information.

**Parameters:**
- `token` (string): JWT access token

**Returns:** AuthUser

```javascript
const user = auth.getUser(accessToken)
console.log(user.email) // user@example.com
```

### `verifyToken(token)`

Verify if a JWT token is valid.

**Parameters:**
- `token` (string): JWT access token

**Returns:** Promise<boolean>

```javascript
const isValid = await auth.verifyToken(accessToken)
```

## TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import { YourAuth, AuthUser, AuthResponse, YourAuthError } from 'yourauth-js'

const auth = new YourAuth({ apiKey: 'your-api-key' })

try {
  const result: AuthResponse = await auth.login('user@example.com', 'password')
  const user: AuthUser = result.data!.user
} catch (error) {
  const authError = error as YourAuthError
  console.error(`Error ${authError.status}: ${authError.message}`)
}
```

## Error Handling

The SDK throws `YourAuthError` objects with additional context:

```javascript
try {
  await auth.signup('invalid-email', 'weak')
} catch (error) {
  console.error(error.message) // Human-readable error message
  console.error(error.status)  // HTTP status code (400, 401, etc.)
  console.error(error.code)    // Internal error code
}
```

## React Example

```jsx
import React, { useState } from 'react'
import { YourAuth } from 'yourauth-js'

const auth = new YourAuth({ apiKey: process.env.REACT_APP_YOURAUTH_API_KEY })

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await auth.login(email, password)
      
      // Store tokens
      localStorage.setItem('accessToken', result.data.tokens.accessToken)
      localStorage.setItem('refreshToken', result.data.tokens.refreshToken)
      
      // Redirect or update UI
      console.log('Login successful!', result.data.user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit">Login</button>
    </form>
  )
}
```

## Node.js Example

```javascript
const { YourAuth } = require('yourauth-js')

const auth = new YourAuth({
  apiKey: process.env.YOURAUTH_API_KEY,
  baseURL: 'http://localhost:5000/api' // For development
})

async function authenticateUser(email, password) {
  try {
    const result = await auth.login(email, password)
    
    // Verify the token
    const isValid = await auth.verifyToken(result.data.tokens.accessToken)
    
    if (isValid) {
      const user = auth.getUser(result.data.tokens.accessToken)
      return user
    }
  } catch (error) {
    console.error('Authentication failed:', error.message)
    throw error
  }
}
```

## Best Practices

### 1. Secure API Key Storage

Never expose your API key in client-side code:

```javascript
// ❌ Don't do this
const auth = new YourAuth({ apiKey: 'ya_1234567890abcdef' })

// ✅ Use environment variables
const auth = new YourAuth({ apiKey: process.env.YOURAUTH_API_KEY })
```

### 2. Token Management

Store tokens securely and handle expiration:

```javascript
// Store tokens after successful authentication
const storeTokens = (tokens) => {
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
}

// Check token validity before API calls
const getValidToken = async () => {
  const token = localStorage.getItem('accessToken')
  
  if (!token) return null
  
  try {
    const isValid = await auth.verifyToken(token)
    return isValid ? token : null
  } catch (error) {
    return null
  }
}
```

### 3. Error Handling

Implement comprehensive error handling:

```javascript
const handleAuthError = (error) => {
  switch (error.status) {
    case 400:
      return 'Invalid email or password format'
    case 401:
      return 'Invalid credentials'
    case 429:
      return 'Too many attempts. Please try again later.'
    case 500:
      return 'Service temporarily unavailable'
    default:
      return error.message || 'Authentication failed'
  }
}
```

## Testing

The SDK includes comprehensive tests. Run them with:

```bash
npm test
```

## Support

- **Documentation**: [https://docs.yourauth.dev](https://docs.yourauth.dev)
- **Dashboard**: [https://dashboard.yourauth.dev](https://dashboard.yourauth.dev)
- **GitHub**: [https://github.com/yourauth/yourauth-js](https://github.com/yourauth/yourauth-js)
- **Email**: support@yourauth.dev

## License

MIT License - see [LICENSE](LICENSE) file for details.
# YourAuth Backend

Node.js/Express API server for YourAuth authentication service.

## Features

- **JWT Authentication**: RS256 encryption with access/refresh tokens
- **Multi-tenancy**: Isolated user bases per developer
- **Password Security**: bcrypt hashing with salt rounds
- **Real-time Analytics**: User activity logging and metrics
- **Production Ready**: Comprehensive error handling and security

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Resend account (for email)

### Installation

```bash
cd apps/backend
npm install
```

### Environment Setup

Create a `.env` file in the `apps/backend` directory:

```bash
# Supabase Configuration (auto-populated when connected in Bolt)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# JWT Keys (generated automatically on first run)
JWT_PRIVATE_KEY=generated_rsa_private_key
JWT_PUBLIC_KEY=generated_rsa_public_key

# Stripe Configuration (uncomment when ready for billing)
# STRIPE_SECRET_KEY=sk_test_your_stripe_key
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application Configuration
NODE_ENV=development
PORT=5000
FRONTEND_DASHBOARD_URL=http://localhost:5173
FRONTEND_LANDING_URL=http://localhost:5174
```

### Database Setup

The backend automatically creates the required database tables when connected to Supabase:

- `developers` - Developer accounts with API credentials
- `users` - End-user accounts (multi-tenant)
- `logs` - Activity logs for analytics

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test
```

## API Endpoints

### Developer Authentication

#### POST `/api/dev/signup`
Register a new developer account.

**Request:**
```json
{
  "email": "developer@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Developer account created successfully",
  "data": {
    "developer": {
      "id": "uuid",
      "email": "developer@example.com",
      "plan": "free",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    },
    "credentials": {
      "apiKey": "ya_abc123...",
      "apiSecret": "secret_xyz789..."
    }
  }
}
```

#### POST `/api/dev/login`
Authenticate a developer.

**Request:**
```json
{
  "email": "developer@example.com", 
  "password": "SecurePassword123"
}
```

#### GET `/api/dev/dashboard`
Get dashboard analytics (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "activeUsers": 45,
      "totalLogins": 324,
      "failedLogins": 12,
      "usageCount": 150,
      "quotaLimit": 100,
      "plan": "free"
    },
    "recentUsers": [...],
    "recentLogs": [...],
    "developer": {...}
  }
}
```

### User Authentication (Multi-tenant)

#### POST `/api/auth/signup`
Register a new user under a developer.

**Headers:**
```
X-API-Key: ya_your_api_key
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Authenticate a user.

**Headers:**
```
X-API-Key: ya_your_api_key
```

#### POST `/api/auth/reset`
Request password reset.

#### GET `/.well-known/jwks.json`
JWT public keys for token verification.

## Security Features

### Password Hashing
- bcrypt with 12 salt rounds
- Secure random salt generation
- Protection against rainbow table attacks

### JWT Implementation
- RS256 asymmetric encryption
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Public key verification endpoint

### Input Validation
- Zod schema validation
- Email format validation
- Password strength requirements
- SQL injection protection

### Rate Limiting & Quotas
- Usage tracking per developer
- Plan-based quotas (Free: 100 users, Pro: 10,000)
- Automatic quota enforcement

## Database Schema

### Developers Table
```sql
CREATE TABLE developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  api_key text UNIQUE NOT NULL,
  api_secret text NOT NULL,
  created_at timestamptz DEFAULT now(),
  plan text DEFAULT 'free',
  usage_count integer DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text
);
```

### Users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES developers(id),
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  UNIQUE(developer_id, email)
);
```

### Logs Table
```sql
CREATE TABLE logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES developers(id),
  user_id uuid REFERENCES users(id),
  event_type text NOT NULL,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);
```

## Error Handling

The API uses structured error responses:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": [...]
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (suspended account)
- `404` - Not Found
- `429` - Rate Limited (quota exceeded)
- `500` - Internal Server Error

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

### Test Coverage
- Unit tests for utilities and middleware
- Integration tests for API endpoints
- Authentication flow testing
- Error handling validation

## Deployment

### Railway Deployment

1. **Connect Repository:**
   ```bash
   # Connect to Railway
   railway login
   railway link
   ```

2. **Set Environment Variables:**
   ```bash
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   railway variables set RESEND_API_KEY=your_resend_key
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Render Deployment

1. **Create Web Service** on Render dashboard
2. **Connect GitHub repository**
3. **Configure Build Settings:**
   - Build Command: `cd apps/backend && npm install && npm run build`
   - Start Command: `cd apps/backend && npm start`
4. **Set Environment Variables** in Render dashboard

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm install --only=production
COPY apps/backend/dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

## Monitoring & Logs

### Health Check
```bash
GET /health
```

### Application Logs
The server logs important events:
- Authentication attempts
- API usage metrics
- Error occurrences
- Performance metrics

### Database Monitoring
- Connection pool status
- Query performance
- Row-level security policies

## Performance Optimization

### Database Indexing
```sql
-- Optimized indexes for common queries
CREATE INDEX idx_developers_email ON developers(email);
CREATE INDEX idx_users_developer_email ON users(developer_id, email);
CREATE INDEX idx_logs_developer_created ON logs(developer_id, created_at DESC);
```

### Caching Strategy
- In-memory JWT key caching
- Database connection pooling
- Response compression

### Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Configured per environment
  crossOriginEmbedderPolicy: false
}))
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```
   Error: connect ECONNREFUSED
   ```
   - Verify Supabase URL and credentials
   - Check network connectivity
   - Ensure Supabase project is active

2. **JWT Key Generation Failed**
   ```
   Error: ENOENT: no such file or directory
   ```
   - Ensure write permissions in `keys/` directory
   - Check disk space availability

3. **API Key Authentication Failed**
   ```
   Error: Invalid API key
   ```
   - Verify API key format (starts with `ya_`)
   - Check developer account status
   - Ensure API key is active

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm run dev
```

## Support

- **Documentation**: [Backend API Docs](https://docs.yourauth.dev/backend)
- **GitHub Issues**: [Report Issues](https://github.com/yourauth/yourauth/issues)
- **Email Support**: backend-support@yourauth.dev

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

MIT License - see [LICENSE](../../LICENSE) for details.
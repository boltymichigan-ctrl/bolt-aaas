# YourAuth Dashboard

React-based developer dashboard for managing authentication, users, and analytics.

## Features

- **Developer Authentication**: Secure login/signup for developers
- **User Management**: View, search, and manage end users
- **Real-time Analytics**: Track signups, logins, and activity
- **API Key Management**: View and regenerate API credentials  
- **Billing Integration**: Subscription management and usage quotas
- **Responsive Design**: Works on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- Node.js 18+
- YourAuth backend running
- Modern web browser

### Installation

```bash
cd apps/dashboard
npm install
```

### Configuration

Create a `.env.local` file:

```bash
VITE_API_URL=http://localhost:5000/api
```

For production:
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
apps/dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── LoadingSpinner.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts      # Authentication hook
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx   # Developer login
│   │   ├── SignupPage.tsx  # Developer registration
│   │   ├── DashboardPage.tsx # Analytics overview
│   │   ├── UsersPage.tsx   # User management
│   │   ├── LogsPage.tsx    # Activity logs
│   │   ├── SettingsPage.tsx # Account settings
│   │   └── BillingPage.tsx # Subscription management
│   ├── services/           # API services
│   │   └── api.ts          # HTTP client and endpoints
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── dist/                   # Production build output
```

## Pages & Features

### 🔐 Authentication Pages

#### Developer Login (`/login`)
- Email/password authentication
- JWT token management
- Remember me functionality
- Password validation

#### Developer Signup (`/signup`)
- Account registration
- Password strength validation
- API credential generation
- Automatic login after signup

### 📊 Dashboard Overview (`/`)

**Metrics Cards:**
- Total Users
- Active Users (30 days)
- Total Logins
- Failed Login Attempts

**Usage Quota:**
- Visual progress bar
- Plan-based limits
- Upgrade warnings

**Recent Activity:**
- Latest user signups
- Recent authentication events
- Real-time updates

### 👥 User Management (`/users`)

**Features:**
- Paginated user list
- Search by email
- Filter by status (active/suspended)
- User details view
- Bulk operations

**User Table Columns:**
- Avatar (generated from email)
- Email address
- Account status
- Join date
- Actions menu

### 📝 Activity Logs (`/logs`)

**Event Types:**
- User signup
- Successful login
- Failed login attempt
- Password reset request
- User logout

**Filtering:**
- Event type filter
- Date range selection
- IP address search
- User email search

**Export Options:**
- CSV download
- JSON export
- Filtered data export

### ⚙️ Settings (`/settings`)

**Account Information:**
- Developer email (read-only)
- Current plan display
- Member since date

**API Credentials:**
- API key display/copy
- API secret management
- Key regeneration
- Integration examples

**Security:**
- Password change
- Two-factor authentication
- Session management

### 💳 Billing (`/billing`)

**Plan Management:**
- Current plan overview
- Usage statistics
- Upgrade/downgrade options
- Billing history

**Payment Methods:**
- Credit card management
- Invoice downloads
- Subscription status

## Design System

### Color Palette

```css
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --secondary-500: #14b8a6;
  --gray-50: #f9fafb;
  --gray-900: #111827;
}
```

### Typography

```css
/* Headings */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
```

### Component Classes

```css
/* Buttons */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-secondary {
  @apply bg-white hover:bg-gray-50 text-gray-700 border px-4 py-2 rounded-lg font-medium transition-colors;
}

/* Cards */
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
}

/* Input Fields */
.input {
  @apply block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500;
}
```

### Animations

```css
/* Fade In */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

/* Slide Up */
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

/* Bounce Subtle */
.animate-bounce-subtle {
  animation: bounceSubtle 0.6s ease-in-out;
}
```

## State Management

### Authentication Context

```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string) => Promise<void>
}
```

### API State with React Query

```typescript
// Dashboard data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => dashboardService.getDashboard(),
  refetchInterval: 30000, // 30 seconds
})
```

## API Integration

### HTTP Client Configuration

```typescript
// apps/dashboard/src/services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatic token handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on token expiry
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Dashboard Service

```typescript
export const dashboardService = {
  getDashboard: () => api.get('/dev/dashboard'),
  getUsers: (page = 1, limit = 20) => api.get(`/dev/users?page=${page}&limit=${limit}`),
  getLogs: (filters = {}) => api.get('/dev/logs', { params: filters }),
}
```

## Responsive Design

### Breakpoints

```css
/* Mobile First */
.mobile { } /* Default: 0px+ */
.sm { } /* 640px+ */
.md { } /* 768px+ */
.lg { } /* 1024px+ */
.xl { } /* 1280px+ */
```

### Layout Adaptations

- **Mobile (< 768px)**: Collapsed sidebar, stacked cards
- **Tablet (768-1024px)**: Sidebar overlay, 2-column layout
- **Desktop (> 1024px)**: Fixed sidebar, 3-column layout

## Testing

```bash
# Run component tests
npm run test

# Visual testing with Storybook (if configured)
npm run storybook

# E2E testing with Playwright (if configured)
npm run test:e2e
```

### Testing Strategy

- **Unit Tests**: Individual components and hooks
- **Integration Tests**: API service layer
- **Visual Tests**: Component render verification
- **E2E Tests**: Complete user workflows

## Performance Optimization

### Bundle Optimization

```typescript
// Lazy loading for routes
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))

// Code splitting by route
<Route path="/users" element={<Suspense fallback={<Loading />}><UsersPage /></Suspense>} />
```

### Image Optimization

- SVG icons for crisp display
- Responsive images with `srcset`
- Lazy loading for charts and graphs

### Caching Strategy

- API response caching with React Query
- Browser caching for static assets
- Service worker for offline capability

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository:**
   - Import project from GitHub
   - Select `apps/dashboard` as root directory

2. **Configure Build Settings:**
   ```
   Framework: Vite
   Root Directory: apps/dashboard
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

4. **Deploy:**
   - Automatic deployments on git push
   - Preview deployments for pull requests

### Netlify Deployment

```toml
# netlify.toml
[build]
  base = "apps/dashboard"
  publish = "apps/dashboard/dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Custom Server Deployment

```dockerfile
# Dockerfile for custom hosting
FROM nginx:alpine
COPY apps/dashboard/dist /usr/share/nginx/html
COPY apps/dashboard/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Variables

### Development

```bash
# .env.local
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=YourAuth Dashboard
VITE_APP_VERSION=1.0.0
```

### Production

```bash
# Production environment
VITE_API_URL=https://api.yourauth.dev
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ANALYTICS_ID=your_analytics_id
```

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

### Token Storage

- Access tokens in memory only
- Refresh tokens in secure httpOnly cookies
- Automatic token refresh before expiry

### Input Sanitization

```typescript
// XSS protection for user input
const sanitizedInput = DOMPurify.sanitize(userInput)
```

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Polyfills

```typescript
// For older browser support
import 'core-js/stable'
import 'regenerator-runtime/runtime'
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```
   Network Error: ERR_CONNECTION_REFUSED
   ```
   - Check backend server is running
   - Verify VITE_API_URL environment variable
   - Check CORS configuration

2. **Authentication Expired**
   ```
   Error 401: Token expired
   ```
   - Token refresh mechanism should handle this
   - Clear local storage if persisting
   - Check token expiry times

3. **Build Failures**
   ```
   Error: Failed to resolve import
   ```
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

### Debug Tools

```bash
# Enable debug logging
VITE_DEBUG=true npm run dev

# Analyze bundle size
npm run build && npx vite-bundle-analyzer
```

## Support

- **Documentation**: [Dashboard Guide](https://docs.yourauth.dev/dashboard)
- **Component Library**: [Design System](https://design.yourauth.dev)
- **GitHub Issues**: [Report Bugs](https://github.com/yourauth/dashboard/issues)
- **Email**: dashboard-support@yourauth.dev

## Contributing

1. **Setup Development Environment:**
   ```bash
   git clone https://github.com/yourauth/yourauth.git
   cd yourauth/apps/dashboard
   npm install
   npm run dev
   ```

2. **Code Style:**
   - Use Prettier for formatting
   - Follow React/TypeScript best practices
   - Write unit tests for new components

3. **Pull Request Process:**
   - Create feature branch
   - Add tests for new functionality  
   - Update documentation
   - Submit PR with detailed description

## License

MIT License - see [LICENSE](../../LICENSE) for details.
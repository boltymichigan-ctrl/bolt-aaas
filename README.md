# YourAuth - Authentication-as-a-Service

A complete SaaS platform providing authentication services for indie developers. Multi-tenant, secure, and production-ready with billing integration.

## 🚀 Features

- **Multi-tenant Authentication**: Isolated user bases for each developer
- **Secure by Default**: bcrypt + JWT (RS256) + refresh tokens
- **Developer Dashboard**: User management, analytics, and billing
- **TypeScript SDK**: Easy integration for any JavaScript/TypeScript project
- **Billing Integration**: Stripe-powered subscription tiers with usage quotas
- **Professional UI**: Modern, responsive design with Tailwind CSS

## 📦 Monorepo Structure

```
├── apps/
│   ├── backend/          # Node.js/Express API server
│   ├── dashboard/        # React dashboard for developers
│   ├── landing/          # Public marketing website
│   └── example/          # Example integration
├── packages/
│   └── sdk/              # TypeScript SDK for developers
└── supabase/
    └── migrations/       # Database schema
```

## 🛠️ Quick Start

1. **Setup Environment**:
   ```bash
   # Install dependencies
   npm install
   
   # Setup Supabase (click "Connect to Supabase" button in Bolt)
   # Copy environment variables to apps/backend/.env
   ```

2. **Database Setup**:
   - The database migrations will be created automatically
   - Tables: developers, users, logs

3. **Start Development**:
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm run dev:backend    # API server on :5000
   npm run dev:dashboard  # Dashboard on :5173
   npm run dev:landing    # Landing page on :5174
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Backend (.env)
```bash
# Supabase (auto-populated when connected)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_key

# JWT Keys (generated automatically)
JWT_PRIVATE_KEY=generated_private_key
JWT_PUBLIC_KEY=generated_public_key

# Stripe (for billing)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# App
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourauth-dashboard.vercel.app
```

## 🌐 Deployment

### Backend (Railway/Render)
- Set environment variables
- Connect to GitHub repo
- Deploy from `apps/backend`

### Dashboard & Landing (Vercel)
- Connect to GitHub repo
- Set build settings:
  - Dashboard: `apps/dashboard`, build command: `npm run build`
  - Landing: `apps/landing`, build command: `npm run build`

### SDK (npm)
```bash
cd packages/sdk
npm publish
```

## 📖 Documentation

- [Backend Setup](apps/backend/README.md) - API server configuration
- [Dashboard Setup](apps/dashboard/README.md) - Developer dashboard
- [Landing Page](apps/landing/README.md) - Marketing website
- [SDK Usage](packages/sdk/README.md) - Integration guide
- [Example App](apps/example/README.md) - Sample integration
- [Billing Setup](docs/BILLING.md) - Stripe configuration

## 🔐 API Endpoints

### Developer APIs
- `POST /api/dev/signup` - Developer registration
- `POST /api/dev/login` - Developer authentication
- `GET /api/dev/dashboard` - Dashboard data
- `POST /api/dev/billing/subscribe` - Create subscription
- `POST /api/dev/billing/webhook` - Stripe webhooks

### User Authentication APIs
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication  
- `POST /api/auth/reset` - Password reset
- `GET /.well-known/jwks.json` - Public keys

## 🧪 Testing

```bash
npm test
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

- Documentation: [docs.yourauth.dev](https://docs.yourauth.dev)
- Email: support@yourauth.dev
- GitHub Issues: [github.com/yourauth/yourauth](https://github.com/yourauth/yourauth)
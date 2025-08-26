import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // JWT
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY || '',
    publicKey: process.env.JWT_PUBLIC_KEY || '',
    issuer: 'yourauth.dev',
    audience: 'yourauth-users',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  
  // Email
  resend: {
    apiKey: process.env.RESEND_API_KEY || 'abcdef', // Default API key provided
  },
  
  // Stripe (commented for free tier)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '', // Uncomment when ready
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceIds: {
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    }
  },
  
  // Quotas
  quotas: {
    free: {
      users: 100,
      requests: 10000,
    },
    pro: {
      users: 10000,
      requests: 1000000,
    }
  },
  
  // Frontend URLs
  frontend: {
    dashboard: process.env.FRONTEND_DASHBOARD_URL || 'http://localhost:5173',
    landing: process.env.FRONTEND_LANDING_URL || 'http://localhost:5174',
  }
};

// Validate required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}
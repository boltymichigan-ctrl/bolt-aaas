export interface Developer {
  id: string;
  email: string;
  password_hash: string;
  api_key: string;
  api_secret: string;
  created_at: string;
  plan: 'free' | 'pro';
  usage_count: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface User {
  id: string;
  developer_id: string;
  email: string;
  password_hash: string;
  created_at: string;
  status: 'active' | 'suspended';
}

export interface Log {
  id: string;
  developer_id: string;
  user_id?: string;
  event_type: 'signup' | 'login' | 'failed_login' | 'reset' | 'logout';
  ip_address: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalLogins: number;
    failedLogins: number;
    usageCount: number;
    quotaLimit: number;
    plan: string;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    created_at: string;
    status: string;
  }>;
  recentLogs: Array<{
    id: string;
    event_type: string;
    user_email?: string;
    ip_address: string;
    created_at: string;
  }>;
}

export interface JwtPayload {
  sub: string; // user id
  dev: string; // developer id
  email: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface RefreshTokenPayload {
  sub: string; // user id
  dev: string; // developer id
  type: 'refresh';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}
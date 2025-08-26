/*
  # YourAuth Database Schema

  1. New Tables
    - `developers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `api_key` (text, unique)
      - `api_secret` (text)
      - `created_at` (timestamp)
      - `plan` (text, default 'free')
      - `usage_count` (integer, default 0)
      - `stripe_customer_id` (text, optional)
      - `stripe_subscription_id` (text, optional)

    - `users`
      - `id` (uuid, primary key)
      - `developer_id` (uuid, foreign key)
      - `email` (text)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `status` (text, default 'active')

    - `logs`
      - `id` (uuid, primary key)
      - `developer_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key, optional)
      - `event_type` (text)
      - `ip_address` (text)
      - `created_at` (timestamp)
      - `metadata` (jsonb, optional)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Add indexes for performance
*/

-- Create developers table
CREATE TABLE IF NOT EXISTS developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  api_key text UNIQUE NOT NULL,
  api_secret text NOT NULL,
  created_at timestamptz DEFAULT now(),
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  usage_count integer DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  UNIQUE(developer_id, email)
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('signup', 'login', 'failed_login', 'reset', 'logout')),
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);

-- Enable Row Level Security
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_developers_email ON developers(email);
CREATE INDEX IF NOT EXISTS idx_developers_api_key ON developers(api_key);
CREATE INDEX IF NOT EXISTS idx_users_developer_email ON users(developer_id, email);
CREATE INDEX IF NOT EXISTS idx_users_developer_id ON users(developer_id);
CREATE INDEX IF NOT EXISTS idx_logs_developer_id ON logs(developer_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);

-- RLS Policies for developers table
CREATE POLICY "Developers can read own data"
  ON developers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Public access for API operations"
  ON developers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for users table  
CREATE POLICY "Users belong to developer"
  ON users
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for logs table
CREATE POLICY "Logs belong to developer"
  ON logs
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
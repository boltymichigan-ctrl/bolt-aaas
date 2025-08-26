import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config';
import { Developer, User, Log } from '../types';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function createDeveloper(email: string, passwordHash: string, apiKey: string, apiSecret: string): Promise<Developer> {
  const { data, error } = await supabase
    .from('developers')
    .insert({
      email,
      password_hash: passwordHash,
      api_key: apiKey,
      api_secret: apiSecret,
      plan: 'free',
      usage_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError('Failed to create developer', error);
  }

  return data;
}

export async function getDeveloperByEmail(email: string): Promise<Developer | null> {
  const { data, error } = await supabase
    .from('developers')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found error
    throw new DatabaseError('Failed to get developer', error);
  }

  return data;
}

export async function getDeveloperByApiKey(apiKey: string): Promise<Developer | null> {
  const { data, error } = await supabase
    .from('developers')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new DatabaseError('Failed to get developer by API key', error);
  }

  return data;
}

export async function updateDeveloperUsage(developerId: string): Promise<void> {
  const { error } = await supabase
    .from('developers')
    .update({ usage_count: supabase.raw('usage_count + 1') })
    .eq('id', developerId);

  if (error) {
    throw new DatabaseError('Failed to update usage count', error);
  }
}

export async function createUser(developerId: string, email: string, passwordHash: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      developer_id: developerId,
      email,
      password_hash: passwordHash,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError('Failed to create user', error);
  }

  return data;
}

export async function getUserByEmail(developerId: string, email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('developer_id', developerId)
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new DatabaseError('Failed to get user', error);
  }

  return data;
}

export async function getUserById(developerId: string, userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('developer_id', developerId)
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new DatabaseError('Failed to get user by ID', error);
  }

  return data;
}

export async function createLog(
  developerId: string,
  eventType: Log['event_type'],
  ipAddress: string,
  userId?: string,
  metadata?: Record<string, any>
): Promise<Log> {
  const { data, error } = await supabase
    .from('logs')
    .insert({
      developer_id: developerId,
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress,
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError('Failed to create log', error);
  }

  return data;
}

export async function getDashboardStats(developerId: string) {
  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('developer_id', developerId);

  // Get active users (logged in within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { count: activeUsers } = await supabase
    .from('logs')
    .select('user_id', { count: 'exact', head: true })
    .eq('developer_id', developerId)
    .eq('event_type', 'login')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get total logins
  const { count: totalLogins } = await supabase
    .from('logs')
    .select('*', { count: 'exact', head: true })
    .eq('developer_id', developerId)
    .eq('event_type', 'login');

  // Get failed logins
  const { count: failedLogins } = await supabase
    .from('logs')
    .select('*', { count: 'exact', head: true })
    .eq('developer_id', developerId)
    .eq('event_type', 'failed_login');

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalLogins: totalLogins || 0,
    failedLogins: failedLogins || 0,
  };
}

export async function getRecentUsers(developerId: string, limit = 5) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, created_at, status')
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new DatabaseError('Failed to get recent users', error);
  }

  return data;
}

export async function getRecentLogs(developerId: string, limit = 10) {
  const { data, error } = await supabase
    .from('logs')
    .select(`
      id,
      event_type,
      ip_address,
      created_at,
      users!inner(email)
    `)
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new DatabaseError('Failed to get recent logs', error);
  }

  return data;
}
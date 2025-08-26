import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Activity, LogIn, AlertTriangle, TrendingUp } from 'lucide-react'
import { dashboardService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const dashboardData = data?.data?.data
  const stats = dashboardData?.stats
  const recentUsers = dashboardData?.recentUsers || []
  const recentLogs = dashboardData?.recentLogs || []

  const usagePercentage = stats ? Math.round((stats.usageCount / stats.quotaLimit) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your authentication service.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card animate-fade-in">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card animate-fade-in">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Activity className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.activeUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card animate-fade-in">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <LogIn className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Logins</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalLogins || 0}</p>
            </div>
          </div>
        </div>

        <div className="card animate-fade-in">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed Logins</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.failedLogins || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Quota */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Usage Quota</h3>
            <span className="text-sm text-gray-500 capitalize">{stats?.plan} Plan</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Users</span>
                <span className="font-medium">
                  {stats?.usageCount || 0} / {stats?.quotaLimit || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {usagePercentage}% of quota used
              </p>
            </div>
            
            {usagePercentage > 80 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    You're approaching your quota limit. Consider upgrading your plan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="overflow-hidden">
          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`p-1.5 rounded-full ${
                    log.event_type === 'login' ? 'bg-green-100' :
                    log.event_type === 'signup' ? 'bg-blue-100' :
                    log.event_type === 'failed_login' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {log.event_type === 'login' ? (
                      <LogIn className="h-4 w-4 text-green-600" />
                    ) : log.event_type === 'signup' ? (
                      <Users className="h-4 w-4 text-blue-600" />
                    ) : log.event_type === 'failed_login' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {log.user_email} - {log.event_type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()} • {log.ip_address}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
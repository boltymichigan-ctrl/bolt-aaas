import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Filter, Download, AlertTriangle, Activity, Users, LogIn } from 'lucide-react'
import { dashboardService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const eventTypeIcons = {
  login: { icon: LogIn, color: 'text-green-600', bg: 'bg-green-100' },
  signup: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  failed_login: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  reset: { icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  logout: { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' },
}

export default function LogsPage() {
  const [eventTypeFilter, setEventTypeFilter] = useState('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    refetchInterval: 30000,
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
            Failed to load logs
          </h3>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const logs = data?.data?.data?.recentLogs || []

  // Filter logs based on event type
  const filteredLogs = logs.filter(log => {
    return eventTypeFilter === 'all' || log.event_type === eventTypeFilter
  })

  // Get event type counts
  const eventCounts = logs.reduce((acc, log) => {
    acc[log.event_type] = (acc[log.event_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600">Monitor authentication events and user activity</p>
        </div>
        <button className="btn-secondary">
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Event Type Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(eventTypeIcons).map(([eventType, config]) => {
          const Icon = config.icon
          const count = eventCounts[eventType] || 0
          
          return (
            <div key={eventType} className="card text-center">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${config.bg} mb-2`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <p className="text-lg font-semibold text-gray-900">{count}</p>
              <p className="text-xs text-gray-600 capitalize">
                {eventType.replace('_', ' ')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Events</option>
            <option value="login">Login</option>
            <option value="signup">Signup</option>
            <option value="failed_login">Failed Login</option>
            <option value="reset">Password Reset</option>
            <option value="logout">Logout</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const eventConfig = eventTypeIcons[log.event_type as keyof typeof eventTypeIcons] || eventTypeIcons.logout
                  const Icon = eventConfig.icon
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded-full ${eventConfig.bg}`}>
                            <Icon className={`h-4 w-4 ${eventConfig.color}`} />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {log.event_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary-700">
                              {(log.user_email || 'Unknown').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">{log.user_email || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No logs found
                    </h3>
                    <p className="text-gray-600">
                      {eventTypeFilter !== 'all' 
                        ? 'No events of this type found'
                        : 'Activity logs will appear here when users interact with your authentication service'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
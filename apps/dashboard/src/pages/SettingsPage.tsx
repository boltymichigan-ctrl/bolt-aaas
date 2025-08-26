import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Settings, Key, Copy, RotateCcw, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { dashboardService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

export default function SettingsPage() {
  const [showApiSecret, setShowApiSecret] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  
  const { user } = useAuth()
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
  })

  const developer = data?.data?.data?.developer

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and API credentials</p>
      </div>

      {/* Account Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input opacity-60 cursor-not-allowed mt-1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Plan</label>
            <div className="mt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 capitalize">
                {user?.plan} Plan
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="text-sm text-gray-600 mt-1">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* API Credentials */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">API Credentials</h3>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Keep your API credentials secure. Never expose them in client-side code.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={developer?.apiKey || ''}
                disabled
                className="input flex-1 font-mono text-sm opacity-60 cursor-not-allowed"
              />
              <button
                onClick={() => copyToClipboard(developer?.apiKey || '', 'API Key')}
                className="btn-secondary"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied === 'API Key' && (
              <p className="text-sm text-green-600 mt-1">API Key copied to clipboard!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
            <div className="flex items-center space-x-2">
              <input
                type={showApiSecret ? 'text' : 'password'}
                value="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                disabled
                className="input flex-1 font-mono text-sm opacity-60 cursor-not-allowed"
              />
              <button
                onClick={() => setShowApiSecret(!showApiSecret)}
                className="btn-secondary"
              >
                {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => copyToClipboard('demo-api-secret-not-shown', 'API Secret')}
                className="btn-secondary"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied === 'API Secret' && (
              <p className="text-sm text-green-600 mt-1">API Secret copied to clipboard!</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="btn-secondary">
              <RotateCcw className="h-4 w-4 mr-2" />
              Regenerate API Key
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will invalidate your current API key. Make sure to update all your applications.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Guide */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Integration</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Install the YourAuth SDK:</p>
            <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm">
              <div className="flex items-center justify-between">
                <span>npm install yourauth-js</span>
                <button
                  onClick={() => copyToClipboard('npm install yourauth-js', 'Install Command')}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Initialize the client:</p>
            <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`import { YourAuth } from 'yourauth-js'

const auth = new YourAuth({
  apiKey: '${developer?.apiKey || 'your-api-key'}'
})`}
              </pre>
              <button
                onClick={() => copyToClipboard(`import { YourAuth } from 'yourauth-js'\n\nconst auth = new YourAuth({\n  apiKey: '${developer?.apiKey || 'your-api-key'}'\n})`, 'Integration Code')}
                className="text-gray-400 hover:text-white float-right mt-2"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied === 'Integration Code' && (
              <p className="text-sm text-green-600 mt-1">Integration code copied!</p>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
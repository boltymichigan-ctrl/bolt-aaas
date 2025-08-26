import React from 'react'
import { CreditCard, Check, Zap, Crown, AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '100 users',
      '10,000 API requests',
      'Email support',
      'Basic analytics',
    ],
    limitations: [
      'Limited user base',
      'Basic features only',
    ],
    current: true,
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For growing applications',
    features: [
      '10,000 users',
      '1,000,000 API requests',
      'Priority support',
      'Advanced analytics',
      'Webhook support',
      'Custom domains',
    ],
    popular: true,
    comingSoon: true,
  },
]

export default function BillingPage() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
              <p className="text-gray-600 capitalize">{user?.plan} Plan</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">$0<span className="text-sm font-normal">/mo</span></p>
            <p className="text-sm text-gray-500">Next billing: Never</p>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This is a demo version. Billing features are currently disabled. 
              In production, you would integrate with Stripe for payments.
            </p>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative card transition-all duration-200 hover:shadow-lg ${
                plan.popular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">LIMITATIONS</p>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-center">
                        <AlertTriangle className="h-3 w-3 text-yellow-500 mr-2" />
                        <span className="text-xs text-gray-600">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                {plan.current ? (
                  <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : plan.comingSoon ? (
                  <button disabled className="w-full btn-primary opacity-50 cursor-not-allowed">
                    Coming Soon
                  </button>
                ) : (
                  <button className="w-full btn-primary">
                    Upgrade to {plan.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">How does billing work?</h4>
            <p className="text-sm text-gray-600 mt-1">
              You're billed monthly based on your selected plan. Usage over your quota will be charged separately.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900">What happens if I exceed my quota?</h4>
            <p className="text-sm text-gray-600 mt-1">
              API requests will be rate-limited once you hit your quota. Consider upgrading to avoid service interruption.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
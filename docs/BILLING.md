# YourAuth Billing Integration

Complete guide for setting up Stripe billing, subscription management, and usage quotas.

## Overview

YourAuth includes a comprehensive billing system with:
- **Stripe Integration**: Secure payment processing
- **Subscription Tiers**: Free and Pro plans with different quotas
- **Usage Tracking**: Real-time quota monitoring and enforcement
- **Webhook Handling**: Automatic subscription status updates
- **Dashboard Integration**: Billing management UI

## Stripe Setup

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Get your API keys from the dashboard

### 2. Configure Products and Prices

Create products in Stripe Dashboard:

```javascript
// Free Plan (for reference only - no Stripe product needed)
{
  name: "Free Plan",
  features: ["100 users", "10,000 API requests", "Email support"]
}

// Pro Plan
{
  name: "Pro Plan", 
  price: "$29/month",
  features: ["10,000 users", "1,000,000 API requests", "Priority support"]
}
```

### 3. Environment Variables

Add to your backend `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Product Price IDs
STRIPE_PRO_PRICE_ID=price_1234567890abcdef
```

## Backend Implementation

### Stripe Service

```typescript
// apps/backend/src/services/stripe.ts
import Stripe from 'stripe'
import { config } from '../config/config'

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
})

export class StripeService {
  // Create customer
  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'yourauth'
      }
    })
  }

  // Create checkout session
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        source: 'yourauth'
      }
    })
  }

  // Get subscription
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId)
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.cancel(subscriptionId)
  }

  // Create billing portal session
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  }
}

export const stripeService = new StripeService()
```

### Billing Routes

```typescript
// apps/backend/src/routes/billing.ts
import express from 'express'
import { stripeService } from '../services/stripe'
import { authenticateDeveloper } from '../middleware/auth'
import { updateDeveloperSubscription } from '../utils/database'

const router = express.Router()

// Create checkout session
router.post('/subscribe', authenticateDeveloper, async (req: any, res, next) => {
  try {
    const developer = req.developer
    const { priceId } = req.body

    // Create Stripe customer if doesn't exist
    let customerId = developer.stripe_customer_id
    if (!customerId) {
      const customer = await stripeService.createCustomer(developer.email)
      customerId = customer.id
      
      // Update developer record
      await updateDeveloperCustomerId(developer.id, customerId)
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${config.frontend.dashboard}/billing?success=true`,
      `${config.frontend.dashboard}/billing?canceled=true`
    )

    res.json({
      success: true,
      data: {
        checkoutUrl: session.url
      }
    })
  } catch (error) {
    next(error)
  }
})

// Create billing portal session
router.post('/portal', authenticateDeveloper, async (req: any, res, next) => {
  try {
    const developer = req.developer
    
    if (!developer.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'No billing account found'
      })
    }

    const session = await stripeService.createBillingPortalSession(
      developer.stripe_customer_id,
      `${config.frontend.dashboard}/billing`
    )

    res.json({
      success: true,
      data: {
        portalUrl: session.url
      }
    })
  } catch (error) {
    next(error)
  }
})

// Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send('Webhook Error')
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
})

export default router
```

### Webhook Handlers

```typescript
// apps/backend/src/services/webhookHandlers.ts
import { Stripe } from 'stripe'
import { updateDeveloperSubscription, getDeveloperByCustomerId } from '../utils/database'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  
  // Get developer by customer ID
  const developer = await getDeveloperByCustomerId(customerId)
  if (!developer) {
    throw new Error(`Developer not found for customer ${customerId}`)
  }

  // Update developer subscription
  await updateDeveloperSubscription(developer.id, {
    stripe_subscription_id: subscriptionId,
    plan: 'pro',
    status: 'active'
  })

  console.log(`Subscription activated for developer ${developer.email}`)
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const developer = await getDeveloperByCustomerId(customerId)
  if (!developer) return

  const plan = subscription.status === 'active' ? 'pro' : 'free'
  
  await updateDeveloperSubscription(developer.id, {
    plan,
    status: subscription.status
  })

  console.log(`Subscription updated for developer ${developer.email}: ${subscription.status}`)
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const developer = await getDeveloperByCustomerId(customerId)
  if (!developer) return

  await updateDeveloperSubscription(developer.id, {
    plan: 'free',
    status: 'canceled',
    stripe_subscription_id: null
  })

  console.log(`Subscription canceled for developer ${developer.email}`)
}

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  console.log(`Payment succeeded for invoice ${invoice.id}`)
  
  // Could send confirmation email, update analytics, etc.
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const developer = await getDeveloperByCustomerId(customerId)
  if (!developer) return

  // Handle failed payment - could downgrade plan, send email, etc.
  console.log(`Payment failed for developer ${developer.email}`)
  
  // Optionally downgrade to free plan after multiple failures
  if (invoice.attempt_count >= 3) {
    await updateDeveloperSubscription(developer.id, {
      plan: 'free',
      status: 'past_due'
    })
  }
}
```

## Database Schema Updates

```sql
-- Add billing columns to developers table
ALTER TABLE developers ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE developers ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- Add billing events table
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES developers(id),
  event_type text NOT NULL,
  stripe_event_id text UNIQUE,
  amount integer,
  currency text DEFAULT 'usd',
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);

-- Indexes for billing queries
CREATE INDEX IF NOT EXISTS idx_developers_stripe_customer ON developers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_developer ON billing_events(developer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
```

## Usage Quota System

### Quota Configuration

```typescript
// apps/backend/src/config/quotas.ts
export const quotas = {
  free: {
    users: 100,
    requests: 10000,
    features: ['basic_auth', 'email_support']
  },
  pro: {
    users: 10000,
    requests: 1000000,
    features: ['basic_auth', 'webhooks', 'priority_support', 'custom_domains']
  }
}

export function getQuotaForPlan(plan: string) {
  return quotas[plan as keyof typeof quotas] || quotas.free
}
```

### Quota Enforcement

```typescript
// apps/backend/src/middleware/quotaCheck.ts
import { Request, Response, NextFunction } from 'express'
import { getQuotaForPlan } from '../config/quotas'
import { AppError } from './errorHandler'

export const enforceUserQuota = async (req: any, res: Response, next: NextFunction) => {
  try {
    const developer = req.developer
    const quota = getQuotaForPlan(developer.plan)
    
    if (developer.usage_count >= quota.users) {
      throw new AppError(
        `User quota exceeded. Upgrade to Pro for higher limits.`,
        429
      )
    }
    
    next()
  } catch (error) {
    next(error)
  }
}

export const enforceRequestQuota = async (req: any, res: Response, next: NextFunction) => {
  try {
    const developer = req.developer
    const quota = getQuotaForPlan(developer.plan)
    
    // Check daily request count (implement daily counter)
    const dailyRequests = await getDailyRequestCount(developer.id)
    const dailyLimit = Math.floor(quota.requests / 30) // Monthly limit / 30 days
    
    if (dailyRequests >= dailyLimit) {
      throw new AppError(
        `Daily request quota exceeded. Upgrade to Pro for higher limits.`,
        429
      )
    }
    
    next()
  } catch (error) {
    next(error)
  }
}
```

### Usage Tracking

```typescript
// apps/backend/src/utils/usage.ts
import { supabase } from './database'

export async function trackUsage(developerId: string, eventType: string, amount = 1) {
  // Update usage counter
  await supabase
    .from('developers')
    .update({ 
      usage_count: supabase.raw('usage_count + ?', [amount])
    })
    .eq('id', developerId)

  // Log usage event
  await supabase
    .from('usage_logs')
    .insert({
      developer_id: developerId,
      event_type: eventType,
      amount,
      created_at: new Date().toISOString()
    })
}

export async function getDailyRequestCount(developerId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  
  const { count } = await supabase
    .from('logs')
    .select('*', { count: 'exact', head: true })
    .eq('developer_id', developerId)
    .gte('created_at', `${today}T00:00:00Z`)
    .lt('created_at', `${today}T23:59:59Z`)

  return count || 0
}

export async function getMonthlyUsage(developerId: string) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('usage_logs')
    .select('event_type, amount, created_at')
    .eq('developer_id', developerId)
    .gte('created_at', startOfMonth.toISOString())

  return data || []
}
```

## Dashboard Integration

### Billing Page Component

```typescript
// apps/dashboard/src/pages/BillingPage.tsx
import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../services/api'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)

  // Get current subscription status
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dev/dashboard')
  })

  const developer = dashboardData?.data?.data?.developer
  const stats = dashboardData?.data?.data?.stats

  // Subscribe to Pro plan
  const subscribeMutation = useMutation({
    mutationFn: (priceId: string) => 
      api.post('/dev/billing/subscribe', { priceId }),
    onSuccess: (data) => {
      window.location.href = data.data.data.checkoutUrl
    }
  })

  // Open billing portal
  const portalMutation = useMutation({
    mutationFn: () => api.post('/dev/billing/portal'),
    onSuccess: (data) => {
      window.location.href = data.data.data.portalUrl
    }
  })

  const handleSubscribe = () => {
    subscribeMutation.mutate(process.env.REACT_APP_STRIPE_PRO_PRICE_ID!)
  }

  const handleManageBilling = () => {
    portalMutation.mutate()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Current Plan */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium capitalize">{developer?.plan} Plan</h3>
            <p className="text-gray-600">
              {developer?.plan === 'free' ? 'Free forever' : '$29/month'}
            </p>
          </div>
          {developer?.plan === 'pro' && (
            <button
              onClick={handleManageBilling}
              className="btn-secondary"
              disabled={portalMutation.isLoading}
            >
              Manage Billing
            </button>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Usage This Month</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Users</span>
              <span>{stats?.usageCount} / {stats?.quotaLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ 
                  width: `${Math.min((stats?.usageCount / stats?.quotaLimit) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Section */}
      {developer?.plan === 'free' && (
        <div className="card border-blue-200 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Upgrade to Pro</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Pro Features</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 10,000 users (100x more)</li>
                <li>• 1,000,000 API requests</li>
                <li>• Priority support</li>
                <li>• Advanced analytics</li>
                <li>• Webhook support</li>
                <li>• Custom domains</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">$29</div>
              <div className="text-gray-600 mb-4">per month</div>
              <button
                onClick={handleSubscribe}
                className="btn-primary w-full"
                disabled={subscribeMutation.isLoading}
              >
                {subscribeMutation.isLoading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Usage Analytics

```typescript
// apps/dashboard/src/components/UsageChart.tsx
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface UsageChartProps {
  data: Array<{
    date: string
    users: number
    requests: number
  }>
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="users" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Users"
          />
          <Line 
            type="monotone" 
            dataKey="requests" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Requests"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

## Webhook Configuration

### Stripe Dashboard Setup

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**: `https://your-api.com/api/dev/billing/webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy webhook secret** to environment variables

### Local Development

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/dev/billing/webhook

# Copy webhook secret from CLI output
```

## Testing

### Test Cards

Use Stripe test cards for development:

```javascript
// Successful payment
const testCard = '4242424242424242'

// Declined payment
const declinedCard = '4000000000000002'

// Requires authentication
const authCard = '4000002500003155'
```

### Test Scenarios

1. **Successful Subscription**:
   - Create checkout session
   - Complete payment with test card
   - Verify webhook received
   - Check plan upgrade in dashboard

2. **Failed Payment**:
   - Use declined test card
   - Verify error handling
   - Check subscription status

3. **Subscription Cancellation**:
   - Cancel via billing portal
   - Verify webhook received
   - Check plan downgrade

### Automated Tests

```typescript
// apps/backend/src/tests/billing.test.ts
import request from 'supertest'
import app from '../index'
import { stripe } from '../services/stripe'

describe('Billing API', () => {
  test('creates checkout session', async () => {
    const response = await request(app)
      .post('/api/dev/billing/subscribe')
      .set('Authorization', 'Bearer valid_jwt_token')
      .send({ priceId: 'price_test_123' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.checkoutUrl).toContain('checkout.stripe.com')
  })

  test('handles webhook events', async () => {
    const event = stripe.webhooks.constructEvent(
      JSON.stringify({ type: 'checkout.session.completed' }),
      'test_signature',
      'test_webhook_secret'
    )

    const response = await request(app)
      .post('/api/dev/billing/webhook')
      .set('stripe-signature', 'test_signature')
      .send(event)

    expect(response.status).toBe(200)
  })
})
```

## Production Deployment

### Environment Variables

```bash
# Production Stripe keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Product Price IDs
STRIPE_PRO_PRICE_ID=price_live_pro_monthly
```

### Security Considerations

1. **Webhook Security**:
   - Always verify webhook signatures
   - Use HTTPS endpoints only
   - Implement idempotency for webhook handlers

2. **API Key Security**:
   - Never expose secret keys in client code
   - Use environment variables
   - Rotate keys regularly

3. **Data Protection**:
   - Store minimal customer data
   - Use Stripe Customer Portal for self-service
   - Comply with PCI DSS requirements

### Monitoring

```typescript
// Monitor billing events
export function logBillingEvent(
  developerId: string,
  eventType: string,
  amount?: number,
  metadata?: any
) {
  console.log(`Billing Event: ${eventType}`, {
    developerId,
    amount,
    metadata,
    timestamp: new Date().toISOString()
  })

  // Send to monitoring service (DataDog, New Relic, etc.)
  // analytics.track('billing_event', { ... })
}
```

## Support & Troubleshooting

### Common Issues

1. **Webhook Not Received**:
   - Check endpoint URL is correct
   - Verify webhook secret matches
   - Check server logs for errors
   - Test with Stripe CLI

2. **Payment Failures**:
   - Check card details are valid
   - Verify customer has sufficient funds
   - Check for 3D Secure requirements
   - Review Stripe Dashboard for details

3. **Subscription Status Sync**:
   - Verify webhook handlers update database
   - Check for race conditions
   - Implement retry logic for failed webhooks

### Debug Tools

```bash
# Check Stripe events
stripe events list --limit 10

# Resend webhook
stripe events resend evt_1234567890

# Test webhook locally
stripe listen --forward-to localhost:5000/api/dev/billing/webhook
```

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Webhook Testing**: [stripe.com/docs/webhooks/test](https://stripe.com/docs/webhooks/test)
- **YourAuth Billing Support**: billing-support@yourauth.dev

## License

MIT License - see [LICENSE](../LICENSE) for details.
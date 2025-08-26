import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Zap, 
  Lock, 
  Code, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Users,
  Activity,
  Github,
  Twitter,
  Menu,
  X,
  Globe
} from 'lucide-react'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'JWT tokens with RS256 encryption, bcrypt password hashing, and production-grade security measures built-in.'
    },
    {
      icon: Zap,
      title: 'Quick Integration',
      description: 'Get up and running in minutes with our simple SDK. Just a few lines of code to add authentication.'
    },
    {
      icon: Lock,
      title: 'Multi-tenant',
      description: 'Isolated user bases for each developer. Your users are completely separate from other developers.'
    },
    {
      icon: Code,
      title: 'Developer First',
      description: 'Built by developers, for developers. Clean APIs, comprehensive docs, and excellent developer experience.'
    },
    {
      icon: Activity,
      title: 'Real-time Analytics',
      description: 'Track signups, logins, and user activity with detailed analytics and logging capabilities.'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Highly available infrastructure that scales automatically with your application growth.'
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '100 users',
        '10,000 API requests',
        'Email support',
        'Basic analytics',
        'JWT authentication',
        'Multi-tenant isolation'
      ],
      popular: false,
      cta: 'Get Started Free'
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
        'SLA guarantee',
        'Priority features'
      ],
      popular: true,
      cta: 'Start Pro Trial'
    }
  ]

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Indie Developer',
      avatar: '👨‍💻',
      content: 'YourAuth saved me weeks of development time. The SDK is incredibly easy to use and the security is bulletproof.'
    },
    {
      name: 'Sarah Kim',
      role: 'Startup Founder',
      avatar: '👩‍💼',
      content: 'We switched to YourAuth from our custom solution and haven\'t looked back. The analytics alone are worth it.'
    },
    {
      name: 'Michael Torres',
      role: 'Full-stack Developer',
      avatar: '👨‍🔬',
      content: 'The multi-tenancy feature is exactly what I needed for my SaaS. Clean separation and great performance.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YourAuth</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="http://localhost:5173" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</a>
              <a href="http://localhost:5173/signup" className="btn-primary">
                Get Started
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-600">Features</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600">Pricing</a>
                <a href="#testimonials" className="block px-3 py-2 text-gray-600">Testimonials</a>
                <a href="http://localhost:5173" className="block px-3 py-2 text-gray-600">Dashboard</a>
                <a href="http://localhost:5173/signup" className="block px-3 py-2 bg-primary-600 text-white rounded-lg">
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 bg-grid-gray-100 opacity-25"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-8">
              <Star className="h-4 w-4 mr-2" />
              Trusted by 1000+ indie developers
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Authentication Made
              <span className="gradient-text block">Simple & Secure</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stop building auth from scratch. YourAuth provides production-ready authentication 
              with JWT tokens, multi-tenancy, and real-time analytics. Get started in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <a href="http://localhost:5173/signup" className="btn-primary inline-flex items-center">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
              <a href="#features" className="btn-secondary inline-flex items-center">
                Learn More
              </a>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="animate-bounce-in">
                <div className="text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl font-bold text-gray-900">&lt;50ms</div>
                <div className="text-gray-600">Response Time</div>
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-gray-600">Developers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-primary-200 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-secondary-200 rounded-full opacity-60"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for authentication
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern security standards and developer experience in mind. 
              Focus on building your app, not authentication infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={feature.title}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 card-hover animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get started in just 3 lines of code
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our SDK makes authentication incredibly simple. Install, initialize, and start authenticating users.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">TypeScript support included</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Automatic token refresh</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Error handling built-in</span>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 animate-slide-up">
              <div className="bg-gray-900 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`// Install the SDK
npm install yourauth-js

// Initialize client
import { YourAuth } from 'yourauth-js'

const auth = new YourAuth({
  apiKey: 'your-api-key'
})

// Start authenticating
const user = await auth.signup(
  'user@example.com',
  'password'
)`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 card-hover animate-slide-up ${
                  plan.popular ? 'border-primary-500 scale-105' : 'border-gray-200'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <a 
                    href={plan.name === 'Free' ? "http://localhost:5173/signup" : "#"} 
                    className={`block w-full text-center py-3 px-6 rounded-xl font-medium transition-all ${
                      plan.popular 
                        ? 'btn-primary' 
                        : 'btn-secondary'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by developers worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what indie developers are saying about YourAuth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 card-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust YourAuth for their authentication needs.
              Start building today with our free plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="http://localhost:5173/signup" className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                Start Free Trial
              </a>
              <a href="http://localhost:5173" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-semibold transition-all">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">YourAuth</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Authentication-as-a-Service for indie developers. Secure, scalable, and simple to integrate.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="http://localhost:5173" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 YourAuth. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
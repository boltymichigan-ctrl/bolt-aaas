# YourAuth Landing Page

Professional marketing website for YourAuth authentication service.

## Overview

A modern, responsive landing page built with React and Tailwind CSS. Features hero section, pricing plans, testimonials, and call-to-action sections designed to convert visitors into YourAuth customers.

## Features

- **Modern Design**: Clean, professional aesthetic with subtle animations
- **Fully Responsive**: Optimized for mobile, tablet, and desktop viewing
- **Performance Optimized**: Fast loading with lazy loading and optimized images
- **SEO Ready**: Meta tags, structured data, and semantic HTML
- **Conversion Focused**: Strategic CTAs and social proof elements

## Quick Start

### Prerequisites

- Node.js 18+
- Modern web browser

### Installation

```bash
cd apps/landing
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5174
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Page Sections

### 🚀 Hero Section

**Key Elements:**
- Compelling headline with gradient text effect
- Clear value proposition
- Primary CTA button (Get Started Free)
- Secondary CTA (Learn More)
- Trust indicators (uptime, response time, developer count)
- Animated floating elements

**Design Features:**
- Gradient background (primary to secondary colors)
- Animated statistics counters
- Responsive text sizing
- Mobile-optimized layout

### ✨ Features Section

**Feature Highlights:**
- Secure by Default (JWT, bcrypt, production security)
- Quick Integration (SDK setup in minutes)
- Multi-tenant Architecture (isolated user bases)
- Developer First (clean APIs, great DX)
- Real-time Analytics (activity tracking)
- Global Scale (auto-scaling infrastructure)

**Visual Elements:**
- Icon-based feature cards
- Hover animations and transitions
- Grid layout (responsive: 1-2-3 columns)
- Card shadows and subtle borders

### 💻 Code Example Section

**Interactive Elements:**
- Live code preview with syntax highlighting
- Terminal-style code window
- Copy-to-clipboard functionality
- Animated typing effect
- Feature checkmarks

**Code Sample:**
```javascript
// Install the SDK
npm install yourauth-js

// Initialize and authenticate
import { YourAuth } from 'yourauth-js'
const auth = new YourAuth({ apiKey: 'your-key' })
const user = await auth.signup('user@example.com', 'password')
```

### 💰 Pricing Section

**Free Tier:**
- 100 users
- 10,000 API requests
- Email support
- Basic analytics
- JWT authentication
- Multi-tenant isolation

**Pro Tier:**
- 10,000 users
- 1,000,000 API requests
- Priority support
- Advanced analytics
- Webhook support
- Custom domains
- SLA guarantee

**Design Elements:**
- Card-based pricing layout
- "Most Popular" badge
- Feature comparison lists
- Gradient borders for emphasis
- Hover effects and animations

### 💬 Testimonials Section

**Customer Stories:**
- Alex Chen (Indie Developer) - SDK ease of use
- Sarah Kim (Startup Founder) - Analytics value
- Michael Torres (Full-stack Developer) - Multi-tenancy benefits

**Visual Design:**
- Avatar placeholders with emojis
- Star rating displays
- Quote formatting
- Card grid layout
- Hover animations

### 📞 Call-to-Action Section

**Final Conversion:**
- Compelling headline
- Benefit restatement
- Dual CTA buttons
- Gradient background
- Action-oriented copy

### 🦶 Footer

**Information Architecture:**
- Company info and branding
- Product links (Features, Pricing, Dashboard)
- Support links (Help, Contact, Status, Security)
- Social media links (GitHub, Twitter)
- Copyright notice

## Design System

### Color Palette

```css
/* Primary Colors (Blue) */
--primary-50: #eff6ff
--primary-500: #3b82f6
--primary-600: #2563eb
--primary-700: #1d4ed8

/* Secondary Colors (Teal) */
--secondary-50: #f0fdfa
--secondary-500: #14b8a6
--secondary-600: #0d9488

/* Neutral Colors */
--gray-50: #f9fafb
--gray-600: #4b5563
--gray-900: #111827
```

### Typography

```css
/* Headings */
.text-6xl { font-size: 3.75rem; line-height: 1; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }

/* Body Text */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }

/* Gradient Text */
.gradient-text {
  @apply bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent;
}
```

### Animation System

```css
/* Fade In Animation */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up Animation */
.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Float Animation */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

### Responsive Breakpoints

```css
/* Mobile First Design */
.container {
  @apply px-4 sm:px-6 lg:px-8;
}

/* Grid Layouts */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8;
}

/* Text Sizing */
.heading-responsive {
  @apply text-4xl md:text-6xl;
}
```

## Component Architecture

### Navigation Component

```typescript
interface NavigationProps {
  scrollY: number
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

const Navigation = ({ scrollY, mobileMenuOpen, setMobileMenuOpen }: NavigationProps) => {
  const isScrolled = scrollY > 50
  
  return (
    <nav className={`fixed w-full z-50 transition-all ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      {/* Navigation content */}
    </nav>
  )
}
```

### Feature Card Component

```typescript
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  index: number
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => (
  <div 
    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 card-hover animate-slide-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
      <Icon className="h-6 w-6 text-primary-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)
```

### Pricing Card Component

```typescript
interface PricingPlan {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  cta: string
}

const PricingCard = ({ plan }: { plan: PricingPlan }) => (
  <div className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 card-hover ${
    plan.popular ? 'border-primary-500 scale-105' : 'border-gray-200'
  }`}>
    {plan.popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    {/* Card content */}
  </div>
)
```

## Performance Optimization

### Image Optimization

```typescript
// Lazy loading images
const LazyImage = ({ src, alt, className }: ImageProps) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading="lazy"
    decoding="async"
  />
)

// WebP with fallback
<picture>
  <source srcSet="hero-image.webp" type="image/webp" />
  <img src="hero-image.jpg" alt="Hero" />
</picture>
```

### Code Splitting

```typescript
// Lazy load components
const TestimonialSection = lazy(() => import('./TestimonialSection'))
const PricingSection = lazy(() => import('./PricingSection'))

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <TestimonialSection />
</Suspense>
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer

# Key metrics to monitor:
# - Total bundle size < 300KB
# - First Contentful Paint < 1.5s
# - Largest Contentful Paint < 2.5s
```

## SEO Optimization

### Meta Tags

```html
<!-- Primary Meta Tags -->
<title>YourAuth - Authentication for Indie Developers</title>
<meta name="title" content="YourAuth - Authentication for Indie Developers">
<meta name="description" content="Simple, secure authentication service for indie developers. Get started with JWT-based auth in minutes.">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourauth.dev/">
<meta property="og:title" content="YourAuth - Authentication for Indie Developers">
<meta property="og:description" content="Simple, secure authentication service for indie developers. Get started with JWT-based auth in minutes.">
<meta property="og:image" content="https://yourauth.dev/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://yourauth.dev/">
<meta property="twitter:title" content="YourAuth - Authentication for Indie Developers">
<meta property="twitter:description" content="Simple, secure authentication service for indie developers. Get started with JWT-based auth in minutes.">
<meta property="twitter:image" content="https://yourauth.dev/twitter-image.jpg">
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "YourAuth",
  "description": "Authentication-as-a-Service for indie developers",
  "url": "https://yourauth.dev",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### Sitemap Generation

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourauth.dev/</loc>
    <lastmod>2024-01-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

## Analytics Integration

### Google Analytics 4

```typescript
// Install gtag
npm install gtag

// Initialize tracking
import { gtag } from 'gtag'

gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href,
})

// Track conversions
const trackSignup = () => {
  gtag('event', 'sign_up', {
    method: 'email'
  })
}
```

### Custom Event Tracking

```typescript
// Track CTA clicks
const trackCTAClick = (location: string) => {
  gtag('event', 'cta_click', {
    event_category: 'engagement',
    event_label: location,
    value: 1
  })
}

// Track scroll depth
const trackScrollDepth = (percentage: number) => {
  gtag('event', 'scroll', {
    event_category: 'engagement',
    event_label: `${percentage}%`,
    value: percentage
  })
}
```

## Deployment

### Vercel Deployment (Recommended)

1. **Repository Setup:**
   ```bash
   # Connect to Vercel
   vercel login
   vercel link
   ```

2. **Build Configuration:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

3. **Environment Variables:**
   ```bash
   # Production environment
   VITE_API_URL=https://api.yourauth.dev
   VITE_GA_ID=G-XXXXXXXXXX
   ```

4. **Custom Domain:**
   ```bash
   vercel domains add yourauth.dev
   vercel domains add www.yourauth.dev
   ```

### Netlify Deployment

```toml
# netlify.toml
[build]
  base = "apps/landing"
  publish = "apps/landing/dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### CDN Configuration

```javascript
// Cloudflare settings
const cacheSettings = {
  "*.js": "max-age=31536000", // 1 year
  "*.css": "max-age=31536000", // 1 year
  "*.png": "max-age=2592000", // 30 days
  "*.jpg": "max-age=2592000", // 30 days
  "/": "max-age=3600" // 1 hour
}
```

## A/B Testing

### Conversion Optimization

```typescript
// Test different hero headlines
const heroVariants = [
  "Authentication Made Simple & Secure",
  "Build Auth in Minutes, Not Weeks",
  "The Auth Service Developers Love"
]

// Test CTA button text
const ctaVariants = [
  "Get Started Free",
  "Start Building Today",
  "Try YourAuth Now"
]

// Test pricing display
const pricingVariants = [
  "monthly", // $29/month
  "annual"   // $290/year (save 17%)
]
```

### Testing Framework

```typescript
// Simple A/B testing
const getVariant = (testName: string, variants: string[]) => {
  const userId = getUserId() // Get or generate user ID
  const hash = hashCode(userId + testName)
  return variants[Math.abs(hash) % variants.length]
}

// Track variant performance
const trackVariant = (testName: string, variant: string, event: string) => {
  gtag('event', event, {
    custom_parameter_1: testName,
    custom_parameter_2: variant
  })
}
```

## Content Management

### Copy Updates

```typescript
// Centralized content configuration
export const content = {
  hero: {
    headline: "Authentication Made Simple & Secure",
    subheadline: "Stop building auth from scratch. YourAuth provides production-ready authentication with JWT tokens, multi-tenancy, and real-time analytics.",
    cta: "Get Started Free"
  },
  features: [
    {
      title: "Secure by Default",
      description: "JWT tokens with RS256 encryption, bcrypt password hashing, and production-grade security measures built-in."
    }
    // ... more features
  ]
}
```

### Internationalization (i18n)

```typescript
// Future i18n support structure
const translations = {
  en: {
    "hero.headline": "Authentication Made Simple & Secure",
    "hero.cta": "Get Started Free"
  },
  es: {
    "hero.headline": "Autenticación Simple y Segura",
    "hero.cta": "Comenzar Gratis"
  }
}
```

## Browser Support

### Target Browsers

- **Chrome** 90+ (85% of traffic)
- **Safari** 14+ (10% of traffic)
- **Firefox** 88+ (3% of traffic)
- **Edge** 90+ (2% of traffic)

### Progressive Enhancement

```css
/* CSS Grid with Flexbox fallback */
.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

@supports (display: grid) {
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
```

### Polyfills

```typescript
// Intersection Observer polyfill for animations
if (!('IntersectionObserver' in window)) {
  import('intersection-observer')
}

// Smooth scroll polyfill
if (!('scrollBehavior' in document.documentElement.style)) {
  import('smoothscroll-polyfill').then(smoothscroll => {
    smoothscroll.polyfill()
  })
}
```

## Monitoring & Analytics

### Core Web Vitals

```typescript
// Monitor performance metrics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log) // Cumulative Layout Shift
getFID(console.log) // First Input Delay
getFCP(console.log) // First Contentful Paint
getLCP(console.log) // Largest Contentful Paint
getTTFB(console.log) // Time to First Byte
```

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
})

// Track custom errors
const trackError = (error: Error, context: any) => {
  Sentry.captureException(error, { extra: context })
}
```

### Conversion Tracking

```typescript
// Track key conversion events
const trackConversion = (event: string, value?: number) => {
  // Google Analytics
  gtag('event', 'conversion', {
    send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
    value: value,
    currency: 'USD'
  })
  
  // Facebook Pixel
  fbq('track', 'Lead', { value: value })
}
```

## Support & Maintenance

### Content Updates

- **Hero Section**: Update headlines based on A/B test results
- **Features**: Add new features as they're released
- **Pricing**: Update plans and pricing as needed
- **Testimonials**: Rotate customer stories quarterly

### Performance Monitoring

- **Lighthouse CI**: Automated performance testing
- **Bundle Size**: Monitor and optimize bundle growth
- **Core Web Vitals**: Track and improve user experience metrics

### Security Updates

- **Dependencies**: Regular security updates
- **CSP Headers**: Content Security Policy configuration
- **SSL/TLS**: Certificate management and renewal

## Contributing

1. **Design Changes:**
   - Follow existing design system
   - Test on multiple devices
   - Maintain accessibility standards

2. **Content Updates:**
   - Use consistent tone and voice
   - Optimize for SEO keywords
   - A/B test significant changes

3. **Performance:**
   - Optimize images before adding
   - Test bundle size impact
   - Verify Core Web Vitals

## License

MIT License - see [LICENSE](../../LICENSE) for details.
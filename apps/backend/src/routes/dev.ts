import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validateRequest, developerSignupSchema, developerLoginSchema } from '../utils/validation';
import { createDeveloper, getDeveloperByEmail, getDashboardStats, getRecentUsers, getRecentLogs } from '../utils/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { authenticateDeveloper } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/config';

const router = express.Router();

// Developer signup
router.post('/signup', validateRequest(developerSignupSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if developer already exists
    const existingDeveloper = await getDeveloperByEmail(email);
    if (existingDeveloper) {
      throw new AppError('Developer already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate API credentials
    const apiKey = `ya_${crypto.randomBytes(16).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');

    // Create developer
    const developer = await createDeveloper(email, passwordHash, apiKey, apiSecret);

    // Generate tokens
    const accessToken = generateAccessToken(developer.id, developer.id, developer.email);
    const refreshToken = generateRefreshToken(developer.id, developer.id);

    res.status(201).json({
      success: true,
      message: 'Developer account created successfully',
      data: {
        developer: {
          id: developer.id,
          email: developer.email,
          plan: developer.plan,
          created_at: developer.created_at,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
        credentials: {
          apiKey,
          apiSecret,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Developer login
router.post('/login', validateRequest(developerLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get developer
    const developer = await getDeveloperByEmail(email);
    if (!developer) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, developer.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(developer.id, developer.id, developer.email);
    const refreshToken = generateRefreshToken(developer.id, developer.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        developer: {
          id: developer.id,
          email: developer.email,
          plan: developer.plan,
          created_at: developer.created_at,
        },
        tokens: {
          accessToken,
          refreshToken,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard data
router.get('/dashboard', authenticateDeveloper, async (req: any, res, next) => {
  try {
    const developer = req.developer;

    // Get stats
    const stats = await getDashboardStats(developer.id);
    
    // Get quota info
    const quotaLimit = config.quotas[developer.plan as keyof typeof config.quotas].users;

    // Get recent data
    const recentUsers = await getRecentUsers(developer.id);
    const recentLogs = await getRecentLogs(developer.id);

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          usageCount: developer.usage_count,
          quotaLimit,
          plan: developer.plan,
        },
        recentUsers,
        recentLogs: recentLogs.map((log: any) => ({
          id: log.id,
          event_type: log.event_type,
          user_email: log.users?.email || 'Unknown',
          ip_address: log.ip_address,
          created_at: log.created_at,
        })),
        developer: {
          id: developer.id,
          email: developer.email,
          plan: developer.plan,
          apiKey: developer.api_key,
          created_at: developer.created_at,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Regenerate API key
router.post('/regenerate-key', authenticateDeveloper, async (req: any, res, next) => {
  try {
    // For now, just return the current key (would implement regeneration in production)
    res.json({
      success: true,
      message: 'API key regeneration is not implemented in this demo',
      data: {
        apiKey: req.developer.api_key,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Billing routes (commented for free tier)
/*
router.post('/billing/subscribe', authenticateDeveloper, async (req: any, res, next) => {
  try {
    // Stripe checkout session creation would go here
    res.json({
      success: true,
      message: 'Billing is not enabled in demo mode',
      data: { checkoutUrl: '#' }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/billing/webhook', async (req, res, next) => {
  try {
    // Stripe webhook handling would go here
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});
*/

export default router;
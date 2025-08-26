import express from 'express';
import bcrypt from 'bcryptjs';
import { validateRequest, userSignupSchema, userLoginSchema, passwordResetSchema } from '../utils/validation';
import { 
  createUser, 
  getUserByEmail, 
  createLog, 
  updateDeveloperUsage,
  getDeveloperByApiKey 
} from '../utils/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { validateApiKey } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/config';

const router = express.Router();

// Get client IP address
const getClientIp = (req: express.Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.connection.remoteAddress || 
         req.ip || 
         'unknown';
};

// Check quota limits
const checkQuota = (developer: any) => {
  const quota = config.quotas[developer.plan as keyof typeof config.quotas];
  if (developer.usage_count >= quota.users) {
    throw new AppError('Usage quota exceeded. Please upgrade your plan.', 429);
  }
};

// User signup
router.post('/signup', validateApiKey, validateRequest(userSignupSchema), async (req: any, res, next) => {
  try {
    const { email, password } = req.body;
    const developer = req.developer;
    const ipAddress = getClientIp(req);

    // Check quota
    checkQuota(developer);

    // Check if user already exists for this developer
    const existingUser = await getUserByEmail(developer.id, email);
    if (existingUser) {
      // Log failed signup attempt
      await createLog(developer.id, 'signup', ipAddress, undefined, { 
        error: 'Email already exists',
        email 
      });
      
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await createUser(developer.id, email, passwordHash);

    // Update developer usage
    await updateDeveloperUsage(developer.id);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, developer.id, user.email);
    const refreshToken = generateRefreshToken(user.id, developer.id);

    // Log successful signup
    await createLog(developer.id, 'signup', ipAddress, user.id, { 
      email: user.email 
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
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

// User login
router.post('/login', validateApiKey, validateRequest(userLoginSchema), async (req: any, res, next) => {
  try {
    const { email, password } = req.body;
    const developer = req.developer;
    const ipAddress = getClientIp(req);

    // Get user
    const user = await getUserByEmail(developer.id, email);
    if (!user) {
      // Log failed login attempt
      await createLog(developer.id, 'failed_login', ipAddress, undefined, { 
        error: 'User not found',
        email 
      });
      
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      await createLog(developer.id, 'failed_login', ipAddress, user.id, { 
        error: 'Account suspended',
        email 
      });
      
      throw new AppError('Account suspended', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Log failed login attempt
      await createLog(developer.id, 'failed_login', ipAddress, user.id, { 
        error: 'Invalid password',
        email 
      });
      
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, developer.id, user.email);
    const refreshToken = generateRefreshToken(user.id, developer.id);

    // Log successful login
    await createLog(developer.id, 'login', ipAddress, user.id, { 
      email: user.email 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
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

// Password reset
router.post('/reset', validateApiKey, validateRequest(passwordResetSchema), async (req: any, res, next) => {
  try {
    const { email } = req.body;
    const developer = req.developer;
    const ipAddress = getClientIp(req);

    // Get user
    const user = await getUserByEmail(developer.id, email);
    
    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // TODO: Implement actual email sending with Resend
      // For now, just log the reset attempt
      await createLog(developer.id, 'reset', ipAddress, user.id, { 
        email: user.email 
      });
      
      // In production, you would:
      // 1. Generate a secure reset token
      // 2. Store it in database with expiration
      // 3. Send email with reset link using Resend API
      // 4. Provide password reset form
      
      console.log(`Password reset requested for user ${email} (Developer: ${developer.email})`);
      console.log('Resend API Key:', config.resend.apiKey);
      // TODO: Implement Resend email sending here
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
});

// Logout (for logging purposes)
router.post('/logout', validateApiKey, async (req: any, res, next) => {
  try {
    const developer = req.developer;
    const ipAddress = getClientIp(req);
    const { userId } = req.body;

    // Log logout
    await createLog(developer.id, 'logout', ipAddress, userId);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
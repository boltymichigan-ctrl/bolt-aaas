import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { getDeveloperByApiKey, getDeveloperByEmail } from '../utils/database';
import { JwtPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  developer?: any;
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const authenticateDeveloper = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    // Try JWT first (for dashboard)
    try {
      const payload = verifyAccessToken(token);
      const developer = await getDeveloperByEmail(payload.email);
      
      if (!developer) {
        return res.status(401).json({
          success: false,
          error: 'Developer not found'
        });
      }
      
      req.developer = developer;
      return next();
    } catch (jwtError) {
      // If JWT fails, try API key
      const developer = await getDeveloperByApiKey(token);
      
      if (!developer) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key or token'
        });
      }
      
      req.developer = developer;
      next();
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

export const validateApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required'
      });
    }

    const developer = await getDeveloperByApiKey(apiKey);
    
    if (!developer) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    req.developer = developer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'API key validation failed'
    });
  }
};
import express from 'express';
import { getPublicKeyJWK } from '../utils/jwt';

const router = express.Router();

// JWKS endpoint for JWT validation
router.get('/jwks.json', (req, res) => {
  try {
    const jwk = getPublicKeyJWK();
    
    res.json({
      keys: [jwk]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate JWKS'
    });
  }
});

export default router;
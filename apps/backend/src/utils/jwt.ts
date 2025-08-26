import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';
import { JwtPayload, RefreshTokenPayload } from '../types';

export function setupJwtKeys() {
  const keysDir = path.join(__dirname, '../../keys');
  const privateKeyPath = path.join(keysDir, 'private.pem');
  const publicKeyPath = path.join(keysDir, 'public.pem');

  // Create keys directory if it doesn't exist
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Generate RSA key pair if they don't exist
  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.log('🔑 Generating RSA key pair...');
    
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);
    
    console.log('✅ RSA key pair generated successfully');
  }

  // Load keys into config if not already set
  if (!config.jwt.privateKey) {
    config.jwt.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  }
  if (!config.jwt.publicKey) {
    config.jwt.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }
}

export function generateAccessToken(userId: string, developerId: string, email: string): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: userId,
    dev: developerId,
    email,
    iss: config.jwt.issuer,
    aud: config.jwt.audience,
  };

  return jwt.sign(payload, config.jwt.privateKey, {
    algorithm: 'RS256',
    expiresIn: config.jwt.expiresIn,
  });
}

export function generateRefreshToken(userId: string, developerId: string): string {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: userId,
    dev: developerId,
    type: 'refresh',
    iss: config.jwt.issuer,
    aud: config.jwt.audience,
  };

  return jwt.sign(payload, config.jwt.privateKey, {
    algorithm: 'RS256',
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.publicKey, {
    algorithms: ['RS256'],
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  }) as JwtPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, config.jwt.publicKey, {
    algorithms: ['RS256'],
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  }) as RefreshTokenPayload;

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return payload;
}

export function getPublicKeyJWK() {
  const key = crypto.createPublicKey(config.jwt.publicKey);
  const jwk = key.export({ format: 'jwk' });
  
  return {
    ...jwk,
    alg: 'RS256',
    use: 'sig',
    kid: '1', // Key ID
  };
}
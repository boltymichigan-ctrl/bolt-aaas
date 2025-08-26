import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';
import { errorHandler, notFound } from './middleware/errorHandler';
import { setupJwtKeys } from './utils/jwt';
import devRoutes from './routes/dev';
import authRoutes from './routes/auth';
import jwksRoutes from './routes/jwks';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yourauth-dashboard.vercel.app',
    'https://yourauth.vercel.app'
  ],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup JWT keys on startup
setupJwtKeys();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/dev', devRoutes);
app.use('/api/auth', authRoutes);
app.use('/.well-known', jwksRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`🚀 YourAuth API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 JWKS endpoint: http://localhost:${PORT}/.well-known/jwks.json`);
});

export default app;
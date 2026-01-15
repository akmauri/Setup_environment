import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import healthRoutes from './routes/health.routes.js';
import youtubeRoutes from './routes/youtube.routes.js';
import instagramRoutes from './routes/instagram.routes.js';
import tiktokRoutes from './routes/tiktok.routes.js';
import twitterRoutes from './routes/twitter.routes.js';
import { tenantDbMiddleware } from './middleware/db.middleware.js';
import { db } from '@mpcas2/db';

// #region agent log
if (typeof fetch !== 'undefined') {
  fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'index.ts:9',
      message: 'Server startup - imports loaded',
      data: { timestamp: Date.now() },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
}
// #endregion

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check routes (before tenant middleware - no tenant context needed)
app.use('/', healthRoutes);

// Database tenant context middleware (applies to all routes)
app.use(tenantDbMiddleware);

// API routes
app.get('/api', (_req, res) => {
  res.json({ message: 'MPCAS2 API is running' });
});

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Social account routes (YouTube, Instagram, TikTok, Twitter, etc.)
app.use('/api/v1/social/youtube', youtubeRoutes);
app.use('/api/v1/social/instagram', instagramRoutes);
app.use('/api/v1/social/tiktok', tiktokRoutes);
app.use('/api/v1/social/twitter', twitterRoutes);

// User profile routes
// #region agent log
try {
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'index.ts:40',
        message: 'Registering user routes',
        data: { userRoutesExists: !!userRoutes, userRoutesType: typeof userRoutes },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
  }
} catch (e) {
  console.error('Debug log error:', e);
}
// #endregion
app.use('/api/v1/user', userRoutes);

// Start server
app.listen(PORT, async () => {
  // #region agent log
  try {
    if (typeof fetch !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'index.ts:46',
          message: 'Server listening callback started',
          data: { port: PORT },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C',
        }),
      }).catch(() => {});
    }
  } catch (e) {
    /* Ignore agent log errors */
  }
  // #endregion
  // Connect to database
  try {
    // #region agent log
    try {
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'index.ts:52',
            message: 'Attempting database connection',
            data: {},
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        }).catch(() => {});
      }
    } catch (e) {
      /* Ignore agent log errors */
    }
    // #endregion
    await db.connect();
    // #region agent log
    try {
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'index.ts:55',
            message: 'Database connection successful',
            data: {},
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        }).catch(() => {});
      }
    } catch (e) {
      /* Ignore agent log errors */
    }
    // #endregion
  } catch (error) {
    // #region agent log
    try {
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/d5dd91a6-fd8a-4d48-998a-9a4a470e0c9a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'index.ts:59',
            message: 'Database connection failed',
            data: { error: error instanceof Error ? error.message : String(error) },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        }).catch(() => {});
      }
    } catch (e) {
      /* Ignore agent log errors */
    }
    // #endregion
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  // eslint-disable-next-line no-console
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth`);
});

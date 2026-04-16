require('dotenv').config();
require('express-async-errors'); // Propagate async errors to error handler

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { metricsMiddleware, client, healthStatus } = require('./metrics/prometheus');
const { startHealthMonitor } = require('./alerts/healthAlert');

// ── Route Imports ─────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const resourcesRoutes = require('./routes/resources');
const aiProxyRoutes = require('./routes/aiProxy');
const postsRoutes = require('./routes/posts');
const stripeRoutes = require('./routes/stripe');

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost',
  'http://localhost:80',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP Request Logging (Morgan → Winston) ──────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: (req) => req.path === '/health' || req.path === '/metrics',
}));

// ── Prometheus Metrics Middleware ─────────────────────────────────────────
app.use(metricsMiddleware);

// ── General Rate Limiting ──────────────────────────────────────────────────
app.use(generalLimiter);

// ── Database Connection ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ── Health Check Endpoint ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  const healthData = {
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(uptime)}s`,
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
  };
  healthStatus.set(1);
  logger.info('Health check requested', { status: 'ok', uptime });
  res.json(healthData);
});

// ── Prometheus Metrics Endpoint ───────────────────────────────────────────
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/ai', aiProxyRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/posts', postsRoutes);

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global Error Handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Codex backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
    logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
  });
}

// ── Start Health Monitor (alerts on degradation) ──────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const HEALTH_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || '60000', 10);
  startHealthMonitor(HEALTH_INTERVAL);
}

// ── Graceful Shutdown ─────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');

  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app; // Export for testing

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes';
import { logger } from './utils/logger';
import { pool } from './config/database';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;

// Test database connection on startup
async function startServer() {
  try {
    // Versuche PostgreSQL
    await pool.query('SELECT NOW()');
    logger.info('✅ PostgreSQL Database connected');
  } catch (error: any) {
    // PostgreSQL nicht verfügbar, verwende SQLite
    logger.info('⚠️  PostgreSQL nicht verfügbar, verwende SQLite...');
    const { initSQLiteDatabase } = await import('./utils/init-sqlite');
    await initSQLiteDatabase();
    logger.info('✅ SQLite Database initialized');
  }

  // Pipeline-Migration ausführen
  try {
    const { migratePipelineColumns } = await import('./utils/migrate-pipeline');
    await migratePipelineColumns();
  } catch (error: any) {
    logger.warn('⚠️  Pipeline-Migration übersprungen:', error.message);
  }

  // Offer Items-Migration ausführen
  try {
    const { migrateOfferItems } = await import('./utils/migrate-offer-items');
    await migrateOfferItems();
  } catch (error: any) {
    logger.warn('⚠️  Offer Items-Migration übersprungen:', error.message);
  }

  // Contact Fields-Migration ausführen
  try {
    const { migrateContactFields } = await import('./utils/migrate-contact-fields');
    await migrateContactFields();
  } catch (error: any) {
    logger.warn('⚠️  Contact Fields-Migration übersprungen:', error.message);
  }
  
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${config.nodeEnv}`);
  });
}

startServer().catch((error) => {
  logger.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

export default app;


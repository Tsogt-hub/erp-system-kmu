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

// CORS Configuration - Production und Development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Erlaubt Requests ohne Origin (z.B. mobile Apps, curl)
    if (!origin) return callback(null, true);
    
    // Erlaubt alle Railway-Domains
    if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In Production alle Origins erlauben (kann später eingeschränkt werden)
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - erhöht für automatisierte Tests und intensives Arbeiten
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // limit each IP to 500 requests per minute
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
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

// Health check (both paths for compatibility)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
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

  // Offer Items Hero-Features-Migration ausführen
  try {
    const { migrateOfferItemsHero } = await import('./utils/migrate-offer-items-hero');
    await migrateOfferItemsHero();
  } catch (error: any) {
    logger.warn('⚠️  Offer Items Hero-Migration übersprungen:', error.message);
  }

  // Contact Fields-Migration ausführen
  try {
    const { migrateContactFields } = await import('./utils/migrate-contact-fields');
    await migrateContactFields();
  } catch (error: any) {
    logger.warn('⚠️  Contact Fields-Migration übersprungen:', error.message);
  }

  // Contacts Hero-Features-Migration ausführen
  try {
    const { migrateContactsTable } = await import('./utils/migrate-contacts');
    await migrateContactsTable();
  } catch (error: any) {
    logger.warn('⚠️  Contacts Hero-Migration übersprungen:', error.message);
  }

  // Tasks-Tabelle initialisieren
  try {
    const { initTasksTable } = await import('./models/Task');
    await initTasksTable();
    logger.info('✅ Tasks table initialized');
  } catch (error: any) {
    logger.warn('⚠️  Tasks-Tabelle Initialisierung übersprungen:', error.message);
  }

  // LogEntries-Tabelle initialisieren
  try {
    const { initLogEntriesTable } = await import('./models/LogEntry');
    initLogEntriesTable();
    logger.info('✅ LogEntries table initialized');
  } catch (error: any) {
    logger.warn('⚠️  LogEntries-Tabelle Initialisierung übersprungen:', error.message);
  }

  // Reminders-Tabelle initialisieren
  try {
    const { initRemindersTable } = await import('./models/Reminder');
    await initRemindersTable();
    logger.info('✅ Reminders table initialized');
  } catch (error: any) {
    logger.warn('⚠️  Reminders-Tabelle Initialisierung übersprungen:', error.message);
  }

  // Documents-Tabelle initialisieren
  try {
    const { initDocumentsTable } = await import('./models/Document');
    await initDocumentsTable();
    logger.info('✅ Documents table initialized');
  } catch (error: any) {
    logger.warn('⚠️  Documents-Tabelle Initialisierung übersprungen:', error.message);
  }

  // Offer Templates-Tabellen initialisieren
  try {
    const { initOfferTemplatesTable } = await import('./models/OfferTemplate');
    await initOfferTemplatesTable();
    logger.info('✅ Offer Templates tables initialized');
  } catch (error: any) {
    logger.warn('⚠️  Offer Templates-Tabellen Initialisierung übersprungen:', error.message);
  }

  // PV Project Data-Tabelle initialisieren
  try {
    const { initPVProjectDataTable } = await import('./models/PVProjectData');
    await initPVProjectDataTable();
    logger.info('✅ PV Project Data table initialized');
  } catch (error: any) {
    logger.warn('⚠️  PV Project Data-Tabelle Initialisierung übersprungen:', error.message);
  }

  // Checklist-Tabellen initialisieren
  try {
    const { initChecklistTables } = await import('./models/Checklist');
    await initChecklistTables();
    logger.info('✅ Checklist tables initialized');
  } catch (error: any) {
    logger.warn('⚠️  Checklist-Tabellen Initialisierung übersprungen:', error.message);
  }

  // Entity Files-Tabelle initialisieren
  try {
    const { initEntityFilesTable } = await import('./models/EntityFile');
    await initEntityFilesTable();
    logger.info('✅ Entity Files table initialized');
  } catch (error: any) {
    logger.warn('⚠️  Entity Files-Tabelle Initialisierung übersprungen:', error.message);
  }

  // Open Items-Tabellen initialisieren
  try {
    const { initOpenItemsTables } = await import('./models/OpenItem');
    await initOpenItemsTables();
    logger.info('✅ Open Items tables initialized');
  } catch (error: any) {
    logger.warn('⚠️  Open Items-Tabellen Initialisierung übersprungen:', error.message);
  }

  // Object Addresses-Tabelle initialisieren
  try {
    const { initObjectAddressesTable } = await import('./models/ObjectAddress');
    await initObjectAddressesTable();
    logger.info('✅ Object Addresses table initialized');
  } catch (error: any) {
    logger.warn('⚠️  Object Addresses-Tabelle Initialisierung übersprungen:', error.message);
  }

  // Payment Data-Tabelle initialisieren
  try {
    const { initPaymentDataTable } = await import('./models/PaymentData');
    await initPaymentDataTable();
    logger.info('✅ Payment Data table initialized');
  } catch (error: any) {
    logger.warn('⚠️  Payment Data-Tabelle Initialisierung übersprungen:', error.message);
  }

  // Items-Tabelle initialisieren (für Hero-Artikel)
  try {
    const { initItemsTable } = await import('./models/Item');
    await initItemsTable();
    console.log('APP: Items table initialized');
  } catch (error: any) {
    console.log('APP: Items-Tabelle übersprungen:', error.message);
  }

  console.log('APP: Preparing to start server...');
  console.log('APP: PORT =', PORT);
  
  // Bind to 0.0.0.0 for Railway deployment
  const HOST = '0.0.0.0';
  const serverPort = Number(PORT) || 3001;
  console.log('APP: Starting server on', HOST, ':', serverPort);
  
  app.listen(serverPort, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${serverPort}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
    logger.info(`🚀 Server running on ${HOST}:${serverPort}`);
  });
  
  console.log('APP: app.listen called');
}

startServer().catch((error) => {
  logger.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

export default app;


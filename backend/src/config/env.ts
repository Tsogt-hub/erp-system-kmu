import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided (Railway format)
function parseDatabaseUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      name: parsed.pathname.slice(1), // Remove leading /
      user: parsed.username,
      password: parsed.password,
    };
  } catch {
    return null;
  }
}

const dbFromUrl = parseDatabaseUrl(process.env.DATABASE_URL);

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    // Use DATABASE_URL if available (Railway), otherwise individual vars
    host: dbFromUrl?.host || process.env.DB_HOST || 'localhost',
    port: dbFromUrl?.port || parseInt(process.env.DB_PORT || '5432'),
    name: dbFromUrl?.name || process.env.DB_NAME || 'erp_system_kmu',
    user: dbFromUrl?.user || process.env.DB_USER || 'postgres',
    password: dbFromUrl?.password || process.env.DB_PASSWORD || 'postgres',
    // Railway PostgreSQL requires SSL
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};



















import { Router, Request, Response } from 'express';
import { seedSQLiteDatabase } from '../utils/seed-sqlite';

const router = Router();

// Geschützter Seed-Endpoint für Railway-Initialisierung
// Nur mit speziellem Setup-Key aufrufbar
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const setupKey = req.headers['x-setup-key'] || req.query.key;
    
    // Einfacher Schutz - in Produktion sollte ein sicherer Key verwendet werden
    if (setupKey !== 'elite-pv-setup-2024') {
      return res.status(403).json({ 
        error: 'Unauthorized', 
        message: 'Setup key required' 
      });
    }

    console.log('🚀 Starting database seed via API...');
    
    await seedSQLiteDatabase();
    
    res.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      loginCredentials: {
        admin: 'admin@test.com / admin123',
        user1: 'max.mustermann@test.com / user123',
        user2: 'anna.schmidt@test.com / user123'
      }
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      error: 'Seed failed', 
      message: error.message 
    });
  }
});

// Health check für Setup-Status
router.get('/status', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'ok',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


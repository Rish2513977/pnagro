import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';

import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import chatbotRoutes from './routes/chatbot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = 3000;

// Start server function
async function startServer() {
  // Connect to MongoDB & Seed initial data non-blocking / safe
  try {
    await connectDB();
    await seedDatabase();
  } catch (dbErr) {
    console.error('Database initialization warning:', dbErr.message);
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API Endpoints (MERN Backend)
  app.use('/api/auth', authRoutes);
  app.use('/api/equipment', equipmentRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/gemini', chatbotRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stack: 'MERN (MongoDB, Express, React, Node.js)',
      platform: 'PNAgro Farm Equipment Rental',
    });
  });

  // Manual Seed trigger endpoint for testing
  app.post('/api/seed', async (req, res) => {
    try {
      await seedDatabase();
      res.json({ success: true, message: 'Database seeded successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // In production or Vite dev mode:
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.join(rootDir, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(rootDir, 'dist', 'index.html'));
    });
  } else {
    // Integrate Vite dev server middleware so port 3000 handles everything unified
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR ? false : undefined,
      },
      appType: 'spa',
      root: rootDir,
    });

    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 PNAgro MERN Stack Server running at http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown
  const handleShutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});

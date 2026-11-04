import mongoose from 'mongoose';
import { initLocalDb } from './localDb.js';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const isDeadPlaceholder = mongoUri && mongoUri.includes('pnagro.fgqflga.mongodb.net');

  if (mongoUri && !isDeadPlaceholder) {
    try {
      console.log('Attempting connection to configured MongoDB cluster...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500,
      });
      console.log('✅ MongoDB connected successfully to remote cluster.');
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to remote MongoDB cluster:', err.message);
      console.log('🔄 Switching seamlessly to resilient zero-latency local persistent database engine...');
      await mongoose.disconnect().catch(() => {});
    }
  } else if (isDeadPlaceholder) {
    console.log('ℹ️ Placeholder MongoDB URI detected. Using zero-latency persistent local database engine...');
  }

  // Resilient zero-download local database engine
  try {
    await initLocalDb();
    console.log('✅ PNagro resilient persistent database active (server/data/pnagro_local_db.json)');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
};

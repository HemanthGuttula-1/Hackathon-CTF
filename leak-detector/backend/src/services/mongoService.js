import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Finding from '../models/Finding.js';
import Alert from '../models/Alert.js';

dotenv.config({ path: '.env.local' });


mongoose.set("bufferCommands", false); // 🔥 MUST
mongoose.set("strictQuery", true);

/**
 * ✅ Global DB state
 */
let isConnected = false;

/**
 * 🚀 MongoDB connection (singleton + retry)
 */
const connectDB = async () => {
  if (isConnected) return true;

  let retries = 0;
  const maxRetries = parseInt(process.env.DB_RETRIES || '5');

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        maxPoolSize: 10,
      });

      isConnected = true;

      mongoose.connection.on('disconnected', () => {
        console.log('📊 MongoDB: Disconnected');
        isConnected = false;
      });

      mongoose.connection.on('error', (err) => {
        console.error('📊 MongoDB Error:', err.message);
      });

      console.log('✅ MongoDB Connected');
      return true;

    } catch (error) {
      retries++;
      const delay = Math.min(1000 * 2 ** retries, 10000);

      console.log(`❌ Mongo retry ${retries}: ${error.message}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }

  console.warn('⚠️ MongoDB unavailable → mock mode');
  return false;
};

/**
 * 💾 Save findings (optimized + safe)
 */
export const saveFindings = async (findings) => {
  if (!findings?.length) return [];

  // ✅ Fast dedup using Map (O(n))
  const uniqueMap = new Map();

  for (const f of findings) {
    const key = `${f.masked_key}-${f.repo}-${f.file_path}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, f);
    }
  }

  const uniqueFindings = Array.from(uniqueMap.values());

  // ❌ If DB not connected → mock mode
  if (!isConnected) {
    console.log('💾 Mock save (DB not connected)');
    return uniqueFindings.map(f => ({
      ...f,
      _id: `mock-${Date.now()}-${Math.random()}`
    }));
  }

  try {
    // ✅ Limit insert size (safety)
    const limited = uniqueFindings.slice(0, 200);

    const saved = await Finding.insertMany(limited, { ordered: false });

    // 🚨 Alerts (HIGH + MEDIUM)
    const alertsToCreate = [];

    for (const finding of saved) {
      if (['HIGH', 'CRITICAL'].includes(finding.risk)) {
        alertsToCreate.push({
          finding: finding._id,
          message: `🚨 ${finding.risk}: ${finding.masked_key} in ${finding.repo}/${finding.file_path}`,
          channel: 'slack',
          status: 'pending'
        });
      }
    }

    if (alertsToCreate.length > 0) {
      await Alert.insertMany(alertsToCreate, { ordered: false });
      console.log(`🔔 Alerts created: ${alertsToCreate.length}`);
    }

    return saved;

  } catch (error) {
    console.error('💾 Save failed:', error.message);

    return uniqueFindings.map(f => ({
      ...f,
      _id: `mock-${Date.now()}-${Math.random()}`
    }));
  }
};

/**
 * 📊 Dashboard data
 */
export const getDashboardData = async (limit = 50) => {
  if (!isConnected) return [];

  try {
    return await Finding.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .select('masked_key type risk risk_score repo file_path timestamp');
  } catch (error) {
    console.warn('📊 Dashboard fallback');
    return [];
  }
};

/**
 * 📈 Risk statistics
 */
export const getRiskStats = async () => {
  if (!isConnected) return [];

  try {
    return await Finding.aggregate([
      {
        $group: {
          _id: { type: '$type', risk: '$risk' },
          count: { $sum: 1 },
          avgEntropy: { $avg: '$entropy' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  } catch (error) {
    console.warn('📈 Stats fallback');
    return [];
  }
};

/**
 * 🧹 Cleanup old findings
 */
export const cleanupOldFindings = async (days = 90) => {
  if (!isConnected) return;

  try {
    const cutoff = new Date(Date.now() - days * 86400000);

    const result = await Finding.deleteMany({
      timestamp: { $lt: cutoff },
      risk: 'LOW'
    });

    console.log(`🧹 Cleaned ${result.deletedCount} LOW-risk findings`);

  } catch (error) {
    console.error('Cleanup failed:', error.message);
  }
};

/**
 * ✅ Export DB state
 */
export const db = {
  connect: connectDB,
  get connected() {
    return isConnected;
  },
  cleanup: cleanupOldFindings
};

export default {
  connectDB,
  saveFindings,
  getDashboardData,
  getRiskStats,
  cleanupOldFindings,
  db
};
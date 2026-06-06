import { Router } from 'express';
import Finding from '../models/Finding.js';

const router = Router();

/**
 * 📊 Dashboard Overview
 * GET /api/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    // 🔥 Run all queries in parallel (FAST)
    const [
      total,
      critical,
      high,
      medium,
      low,
      recentDocs
    ] = await Promise.all([
      Finding.countDocuments(),
      Finding.countDocuments({ risk: 'CRITICAL' }),
      Finding.countDocuments({ risk: 'HIGH' }),
      Finding.countDocuments({ risk: 'MEDIUM' }),
      Finding.countDocuments({ risk: 'LOW' }),
      Finding.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .lean()
    ]);

    res.json({
      success: true,

      // ✅ MATCHES FRONTEND EXACTLY
      summary: {
        total,
        critical,
        high,
        medium,
        low
      },

      // 📌 recent findings (optional UI use)
      recent: recentDocs
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📈 Risk Stats (Chart Ready)
 * GET /api/risks
 */
router.get('/risks', async (req, res) => {
  try {
    const stats = await Finding.aggregate([
      {
        $group: {
          _id: '$type',

          // 🔴 CRITICAL
          critical: {
            $sum: {
              $cond: [{ $eq: ['$risk', 'CRITICAL'] }, 1, 0]
            }
          },

          // 🔥 HIGH
          high: {
            $sum: {
              $cond: [{ $eq: ['$risk', 'HIGH'] }, 1, 0]
            }
          },

          // 🟡 MEDIUM
          medium: {
            $sum: {
              $cond: [{ $eq: ['$risk', 'MEDIUM'] }, 1, 0]
            }
          },

          // 🟢 LOW
          low: {
            $sum: {
              $cond: [{ $eq: ['$risk', 'LOW'] }, 1, 0]
            }
          },

          // 📊 Entropy average
          avgEntropy: { $avg: '$entropy' }
        }
      },
      {
        $sort: { critical: -1, high: -1 } // 🔥 most risky first
      }
    ]);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Risk stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
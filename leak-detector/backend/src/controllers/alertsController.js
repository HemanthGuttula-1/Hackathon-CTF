import Alert from '../models/Alert.js';

/**
 * 🔔 Get Alerts (with filters + pagination)
 * GET /alerts
 */
export const getAlerts = async (req, res) => {
  try {
    const {
      limit = 20,
      page = 1,
      status,
      priority,
      repo
    } = req.query;

    const filter = {};

    // ✅ Default: exclude resolved
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'resolved' };
    }

    if (priority) {
      filter.priority = priority;
    }

    // 🔍 Populate + filter by repo
    let query = Alert.find(filter)
      .populate('finding', 'masked_key type risk repo file_path')
      .sort({ priority: -1, createdAt: -1 });

    const skip = (page - 1) * limit;

    const alerts = await query
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 🔍 Optional repo filtering (after populate)
    const filtered = repo
      ? alerts.filter(a => a.finding?.repo?.includes(repo))
      : alerts;

    res.json({
      success: true,
      page: parseInt(page),
      count: filtered.length,
      data: filtered
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Resolve Alert
 * PATCH /alerts/:id/resolve
 */
export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndUpdate(
      id,
      {
        status: 'resolved',
        resolved_at: new Date()
      },
      { new: true }
    ).populate('finding', 'masked_key type risk repo file_path');

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert resolved',
      data: alert
    });

  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🔁 Retry Failed Alerts
 * POST /alerts/:id/retry
 */
export const retryAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findById(id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.retry_count >= 3) {
      return res.status(400).json({
        error: 'Max retries reached'
      });
    }

    alert.status = 'pending';
    alert.retry_count += 1;

    await alert.save();

    res.json({
      success: true,
      message: 'Retry triggered',
      data: alert
    });

  } catch (error) {
    console.error('Retry alert error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📊 Alert Stats (for dashboard)
 * GET /alerts/stats
 */
export const getAlertStats = async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            priority: '$priority'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // ✅ Format for frontend
    const formatted = {};

    stats.forEach(item => {
      const { status, priority } = item._id;

      if (!formatted[status]) {
        formatted[status] = {};
      }

      formatted[status][priority] = item.count;
    });

    res.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error('Alert stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAlerts,
  resolveAlert,
  retryAlert,
  getAlertStats
};
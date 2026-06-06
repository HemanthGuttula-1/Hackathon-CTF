import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  finding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Finding',
    required: true,
    index: true
  },

  // ✅ Added priority (derived from finding risk)
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    index: true
  },

  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'resolved'],
    default: 'pending',
    index: true
  },

  notified_at: {
    type: Date,
    default: null
  },

  channel: {
    type: String,
    enum: ['console', 'email', 'slack', 'webhook'],
    default: 'console'
  },

  message: {
    type: String,
    required: true
  },

  // ✅ Retry tracking (important for real systems)
  retry_count: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

/**
 * 🚀 UNIQUE ALERT PER FINDING + CHANNEL
 * Prevent duplicate alerts
 */
alertSchema.index({ finding: 1, channel: 1 }, { unique: true });

/**
 * ⚡ Query performance indexes
 */
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ priority: -1, status: 1 });

/**
 * 🔗 Virtual populate (optional usage)
 */
alertSchema.virtual('findingDetails', {
  ref: 'Finding',
  localField: 'finding',
  foreignField: '_id',
  justOne: true
});

/**
 * 🧠 Auto-generate message (SMART)
 */
alertSchema.pre('validate', async function (next) {
  if (this.message) return next();

  try {
    // If finding is populated → use real data
    if (this.populated('findingDetails')) {
      const f = this.findingDetails;

      this.message = `🚨 ${this.priority} ${f.type} detected in ${f.repo}/${f.file_path} → ${f.masked_key}`;
    } else {
      this.message = `🚨 ${this.priority} risk secret detected`;
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * 📌 Static: Get pending alerts
 */
alertSchema.statics.getPendingAlerts = async function (limit = 10) {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .populate('finding', 'masked_key type risk repo file_path');
};

/**
 * 📊 Static: Get alert stats
 */
alertSchema.statics.getAlertStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: { status: '$status', priority: '$priority' },
        count: { $sum: 1 }
      }
    }
  ]);
};

/**
 * ✅ Mark as sent
 */
alertSchema.methods.markAsSent = async function () {
  this.status = 'sent';
  this.notified_at = new Date();
  return this.save();
};

/**
 * ❌ Mark as failed (retry support)
 */
alertSchema.methods.markAsFailed = async function () {
  this.status = 'failed';
  this.retry_count += 1;
  return this.save();
};

/**
 * 🔁 Retry alert (basic logic)
 */
alertSchema.methods.retry = async function () {
  if (this.retry_count >= 3) {
    this.status = 'failed';
    return this.save();
  }

  this.status = 'pending';
  return this.save();
};

export default mongoose.model('Alert', alertSchema);
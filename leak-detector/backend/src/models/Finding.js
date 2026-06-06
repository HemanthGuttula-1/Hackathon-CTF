import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema({

  // 🔑 Core detection data
  masked_key: {
    type: String,
    required: true,
    maxlength: 50,
    index: true
  },

  type: {
    type: String,
    required: true,
    index: true
  },

  risk: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    required: true,
    index: true
  },

  // ✅ Added (important)
  risk_score: {
    type: Number,
    min: 0,
    max: 10,
    index: true
  },

  entropy: {
    type: Number,
    min: 0,
    max: 8,
    required: true,
    index: true
  },

  // 📍 Source info
  repo: {
    type: String,
    required: true,
    index: true
  },

  file_path: {
    type: String,
    required: true,
    index: true
  },

  source: {
    type: String,
    default: 'GitHub',
    enum: ['GitHub', 'Local', 'Mock']
  },

  context: {
    type: String,
    maxlength: 200
  },

  // ⚠️ Store hashed version instead of raw secret (safer)
  full_match_hash: {
    type: String,
    index: true
  },

  position: {
    start: { type: Number, min: 0 },
    end: { type: Number, min: 0 }
  },

  // ✅ Resolution tracking
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },

  resolved_at: {
    type: Date,
    default: null
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }

}, {
  timestamps: true
});

/**
 * 🚨 UNIQUE constraint (prevents duplicates)
 */
findingSchema.index(
  { masked_key: 1, repo: 1, file_path: 1 },
  { unique: true }
);

/**
 * ⚡ Performance indexes
 */
findingSchema.index({ type: 1, risk: 1 });
findingSchema.index({ risk: 1, entropy: -1 });
findingSchema.index({ timestamp: -1 });

/**
 * 📊 Virtual risk score (fallback if missing)
 */
findingSchema.virtual('riskScore').get(function () {
  if (this.risk_score) return this.risk_score;

  const scores = {
    CRITICAL: 95,
    HIGH: 80,
    MEDIUM: 50,
    LOW: 20
  };

  return scores[this.risk] + (this.entropy * 3);
});

/**
 * 🔍 Static: High risk findings
 */
findingSchema.statics.getHighRisk = async function (limit = 10) {
  return this.find({ risk: { $in: ['CRITICAL', 'HIGH'] } })
    .sort({ risk_score: -1, entropy: -1 })
    .limit(limit)
    .select('masked_key type risk risk_score repo file_path timestamp');
};

/**
 * 📊 Static: Recent findings
 */
findingSchema.statics.getRecent = async function (limit = 50) {
  return this.find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('masked_key type risk repo file_path');
};

/**
 * ✅ Mark resolved
 */
findingSchema.methods.resolve = async function () {
  this.resolved = true;
  this.resolved_at = new Date();
  return this.save();
};

/**
 * 🔐 Pre-save: sanitize entropy
 */
findingSchema.pre('save', function (next) {
  if (this.entropy > 8 || this.entropy < 0) {
    this.entropy = Math.max(0, Math.min(8, this.entropy));
  }
  next();
});

export default mongoose.model('Finding', findingSchema);
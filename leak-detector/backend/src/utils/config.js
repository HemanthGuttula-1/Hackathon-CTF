export const SECRET_PATTERNS = {

  // 🔥 AWS Access Key (high confidence)
  aws_access_key: {
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    risk: 'CRITICAL',
    baseScore: 10,
    requiresContext: false
  },
  // 🗄️ MongoDB URI (VERY IMPORTANT)
mongodb_uri: {
  regex: /\bmongodb(\+srv)?:\/\/[a-zA-Z0-9._%+-]+:[^@\s]+@[^\s]+/g,
  risk: 'CRITICAL',
  baseScore: 10,
  requiresContext: false
},
  // 🔥 AWS Secret Key (ONLY with context)
  aws_secret_key: {
    regex: /aws_secret_access_key\s*[:=]\s*[A-Za-z0-9\/+=]{40}/gi,
    risk: 'CRITICAL',
    baseScore: 10,
    requiresContext: true
  },

  // 🔥 OpenAI
  openai: {
    regex: /\bsk-[a-zA-Z0-9]{20,}\b/g,
    risk: 'HIGH',
    baseScore: 9,
    requiresContext: false
  },

  // 🔥 GitHub Token
  github: {
    regex: /\bgh[pousr]_[A-Za-z0-9]{36}\b/g,
    risk: 'HIGH',
    baseScore: 9,
    requiresContext: false
  },

  // 💳 Stripe
  stripe: {
    regex: /\bsk_live_[a-zA-Z0-9]{24}\b/g,
    risk: 'CRITICAL',
    baseScore: 10,
    requiresContext: false
  },

  // 🔥 Google API
  google_api: {
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
    risk: 'HIGH',
    baseScore: 8,
    requiresContext: false
  },

  // 🔥 JWT (validate structure)
  jwt: {
    regex: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    risk: 'MEDIUM',
    baseScore: 7,
    requiresContext: false
  },

  // 🔥 Firebase
  firebase: {
    regex: /\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}\b/g,
    risk: 'HIGH',
    baseScore: 8,
    requiresContext: false
  },

  // 🔐 Private Keys (very high confidence)
  private_key: {
    regex: /-----BEGIN (RSA|EC|PRIVATE) KEY-----/g,
    risk: 'CRITICAL',
    baseScore: 10,
    requiresContext: false
  },

  // 🔑 Generic API Key (STRICT + context required)
  generic_api_key: {
    regex: /(api[_-]?key|token|secret)\s*[:=]\s*['"]?[A-Za-z0-9\-_]{16,}['"]?/gi,
    risk: 'MEDIUM',
    baseScore: 6,
    requiresContext: true
  },

  // 🔐 Bearer Token (strict)
  bearer_token: {
    regex: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/g,
    risk: 'MEDIUM',
    baseScore: 6,
    requiresContext: true
  },

  // 🗄️ Database URL (credential detection)
  db_url: {
    regex: /\b(mongodb|postgres|mysql):\/\/[^\s:@]+:[^\s@]+@[^\s]+\b/g,
    risk: 'HIGH',
    baseScore: 8,
    requiresContext: false
  }
};

export const DETECTION_CONFIG = {
  ENTROPY_THRESHOLD: 4.2,   // 🔽 slightly reduced for real-world keys
  STRICT_ENTROPY_THRESHOLD: 5.0, // 🔥 for generic keys

  CONTEXT_WINDOW: 40,

  FILE_EXTENSIONS: ['.js', '.env', '.json', '.py', '.yaml', '.yml', '.txt'],

  MAX_FILE_SIZE: 50000,
  MAX_FILES_PER_REPO: 30,
  MAX_FINDINGS: 100   // 🔽 reduce noise
};

/**
 * 🚫 Ignore contexts (expanded for hash filtering)
 */
export const IGNORE_CONTEXT = [
  'test',
  'example',
  'dummy',
  'sample',
  'fake',
  'invalid',
  'your_key_here',
  'replace_me',
  'xxxx',
  '123456',

  // 🔥 HASH / CHECKSUM FILTERS (IMPORTANT)
  'sha256',
  'sha512',
  'sha1',
  'md5',
  'hash',
  'checksum',
  'integrity',
  'digest',

  // common package-lock / npm noise
  'resolved',
  'version',
  'dependencies'
];

/**
 * 🚫 Explicit hash patterns (STRONG FILTER)
 */
export const IGNORE_PATTERNS = [
  /^sha\d{3,}-/i,
  /^[a-f0-9]{32,}$/i,   // hex hashes
  /^[A-Za-z0-9+/=]{60,}$/ // long base64 blobs
];
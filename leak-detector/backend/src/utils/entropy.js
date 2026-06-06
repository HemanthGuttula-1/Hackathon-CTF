/**
 * 🔍 Shannon Entropy Calculator
 * Measures randomness of a string
 */
export function shannonEntropy(str) {
  if (!str || typeof str !== 'string' || str.length < 10) return 0;

  const freq = Object.create(null);
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const char = str[i];
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;

  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * 🎯 Dynamic normalization based on charset
 */
export function normalizedEntropy(str) {
  if (!str) return 0;

  const uniqueChars = new Set(str).size;
  const maxEntropy = Math.log2(uniqueChars || 1);

  return maxEntropy === 0 ? 0 : shannonEntropy(str) / maxEntropy;
}

/**
 * 🧠 Classify entropy level (VERY USEFUL)
 */
export function classifyEntropy(str) {
  const entropy = shannonEntropy(str);

  if (entropy >= 4.5) return { level: 'HIGH', entropy };
  if (entropy >= 3.5) return { level: 'MEDIUM', entropy };
  return { level: 'LOW', entropy };
}

/**
 * 🚫 Detect base64-like strings (to avoid false positives)
 */
export function isBase64Like(str) {
  if (!str || str.length < 20) return false;

  return /^[A-Za-z0-9+/=]+$/.test(str);
}

/**
 * 🚫 Detect hash-like strings
 */
export function isHashLike(str) {
  if (!str) return false;

  return (
    /^sha\d{3,}-/i.test(str) ||       // sha256-, sha512-
    /^[a-f0-9]{32,}$/i.test(str) ||  // hex hashes
    /^[A-Za-z0-9+/=]{60,}$/.test(str) // long base64 blobs
  );
}

/**
 * 🧪 Dev test
 */
export function testEntropy() {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('\n🧪 Entropy Tests:');

  const samples = [
    'hello world example',
    'AKIAEXAMPLE12345678',
    'AKIAIOSFODNN7RANDOMKEY123ABC',
    'sha512-+ywrb0AqkfaYuhHs6LxKWgqbh3I72EpEgESCw37o+9qPx9WTCkgDm2B+eMrwehGtHBWHFU4GXvnSCNiFhhausg=='
  ];

  for (const s of samples) {
    const { level, entropy } = classifyEntropy(s);
    console.log(`${level}:`, entropy.toFixed(2), '→', s.slice(0, 30));
  }
}
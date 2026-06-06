import { SECRET_PATTERNS, DETECTION_CONFIG, IGNORE_CONTEXT } from '../utils/config.js';
import { shannonEntropy } from '../utils/entropy.js';

/**
 * 🔍 Scan single file content
 */
export const scanContent = (content, filePath, repo) => {
  if (!content || typeof content !== 'string') return [];

  const findings = [];

  for (const [type, { regex, risk, baseScore }] of Object.entries(SECRET_PATTERNS)) {
    let match;
    regex.lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      const secret = match[0];

      if (!secret || secret.length < 8) continue;

      const start = match.index;
      const end = start + secret.length;

      // ✅ Entropy check
      const entropy = shannonEntropy(secret);
      if (entropy < DETECTION_CONFIG.ENTROPY_THRESHOLD) continue;

      // ✅ Context extraction
      const contextStart = Math.max(0, start - DETECTION_CONFIG.CONTEXT_WINDOW);
      const contextEnd = Math.min(content.length, end + DETECTION_CONFIG.CONTEXT_WINDOW);
      const context = content.slice(contextStart, contextEnd);

      // ✅ Ignore fake/test keys
      const isFake = IGNORE_CONTEXT.some(word =>
        context.toLowerCase().includes(word)
      );
      if (isFake) continue;

      // ✅ Risk score calculation
      const riskScore = Math.min(10, baseScore + (entropy - 4.0));

      findings.push({
        masked_key: `${secret.slice(0, 6)}...${secret.slice(-4)}`,
        type,
        risk,                  // HIGH / MEDIUM / LOW
        risk_score: Number(riskScore.toFixed(2)), // ✅ FIXED
        entropy: Number(entropy.toFixed(2)),
        repo,
        file_path: filePath,
        source: 'GitHub',
        context: context.trim().slice(0, 120),
        full_match: secret,
        position: { start, end }
      });
    }
  }

  return findings;
};

/**
 * 🚀 Process multiple files (parallel + dedup)
 */
export const detectInFiles = async (files) => {
  if (!files || files.length === 0) return [];

  console.log(`🔍 Scanning ${files.length} files...`);

  // ✅ Parallel processing
  const results = await Promise.all(
    files.map(({ content, path, repo }) =>
      Promise.resolve(scanContent(content, path, repo))
    )
  );

  // Flatten results
  let allFindings = results.flat();

  // ✅ Deduplicate (important)
  const uniqueMap = new Map();

  for (const item of allFindings) {
    const key = `${item.repo}-${item.file_path}-${item.full_match}`;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  allFindings = Array.from(uniqueMap.values());

  // ✅ Limit results (avoid overload)
  if (allFindings.length > DETECTION_CONFIG.MAX_FINDINGS) {
    allFindings = allFindings.slice(0, DETECTION_CONFIG.MAX_FINDINGS);
  }

  const high = allFindings.filter(f => f.risk === 'HIGH').length;

  console.log(`✅ Findings: ${allFindings.length} (HIGH: ${high})`);

  return allFindings;
};

export default {
  scanContent,
  detectInFiles
};
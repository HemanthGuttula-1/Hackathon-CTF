import mongoose from 'mongoose';
import * as githubService from '../services/githubService.js';
import * as detectorService from '../services/detectorService.js';
import Finding from '../models/Finding.js';

// ✅ MongoDB connection (singleton style)
let dbConnected = false;

const connectDB = async () => {
  if (dbConnected || !process.env.MONGODB_URI) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('📊 MongoDB Connected');
    dbConnected = true;
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable → running in mock mode');
  }
};

// ✅ Save findings
const saveFindings = async (findings) => {
  if (!findings?.length || !dbConnected) return findings;

  try {
    const saved = await Finding.insertMany(findings);
    console.log(`💾 Saved ${saved.length} findings`);
    return saved;
  } catch (err) {
    console.error('❌ DB Save Error:', err.message);
    return findings;
  }
};

/**
 * 🌐 GLOBAL SEARCH SCAN
 * GET /scan/global?q=aws
 */
export const globalScan = async (req, res) => {
  try {
    await connectDB();
  
    const { query , limit = 20 } = req.body;
    const q = query || 'API_KEY';

    console.log(`🌐 Global scan for: ${q}`);

    // ✅ Real GitHub search
    let files = [];
    try {
      files = await githubService.globalScan(q, limit);
    } catch (err) {
      console.error('❌ GitHub Global API failed:', err.message);
      return res.status(500).json({
        success: false,
        error: 'GitHub API failed',
        details: err.message
      });
    }

    // ✅ Detection
    const findings = await detectorService.detectInFiles(files);

    // ✅ Save
    await saveFindings(findings);

    const highRiskCount = findings.filter(f => f.risk === 'HIGH').length;

    res.json({
      success: true,
      query: q,
      total_files: files.length,
      findings: findings.length,
      high_risk: highRiskCount,
      data: findings.slice(0, 20)
    });

  } catch (error) {
    console.error('❌ Global scan failed:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🎯 SPECIFIC REPO SCAN
 * POST /scan/repo
 * body: { "repo": "facebook/react" }
 */
export const specificRepoScan = async (req, res) => {
  try {
    await connectDB();

    const { repo } = req.body;

    if (!repo || !repo.includes('/')) {
      return res.status(400).json({
        error: 'Invalid repo format',
        example: 'facebook/react'
      });
    }

    console.log(`🎯 Scanning repo: ${repo}`);

    let files;

    try {
      // ✅ Timeout protected real scan
      files = await Promise.race([
        githubService.scanRepo(repo),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('GitHub timeout')), 7000)
        )
      ]);

      console.log(`✅ GitHub API success → ${files.length} files`);

    } catch (err) {
      console.error('❌ GitHub repo scan failed:', err.message);

      return res.status(500).json({
        success: false,
        error: 'GitHub repo scan failed',
        details: err.message
      });
    }

    // ✅ Detection
    const findings = await detectorService.detectInFiles(files);

    // ✅ Save
    await saveFindings(findings);

    const highRiskCount = findings.filter(f => f.risk === 'HIGH').length;

    res.json({
      success: true,
      repo,
      files_scanned: files.length,
      findings: findings.length,
      high_risk: highRiskCount,
      data: findings
    });

  } catch (error) {
    console.error('❌ Repo scan failed:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ❤️ HEALTH CHECK
 */
export const healthCheck = async (req, res) => {
  await connectDB();

  res.json({
    status: 'OK',
    github: process.env.GITHUB_TOKEN ? '✅ ready' : '⚠️ missing token',
    mongodb: dbConnected ? '✅ connected' : '⚠️ mock mode',
    timestamp: new Date().toISOString()
  });
};

export default {
  globalScan,
  specificRepoScan,
  healthCheck
};
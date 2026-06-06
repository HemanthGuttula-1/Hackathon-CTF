import * as mongoService from '../services/mongoService.js';

/**
 * 📊 Dashboard Overview
 * GET /dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const riskFilter = req.query.risk;
    const repoFilter = req.query.repo;

    let data = await mongoService.getDashboardData(limit);

    // 🔍 Filtering
    if (riskFilter) {
      data = data.filter(f => (f.risk || '').toUpperCase() === riskFilter.toUpperCase());
    }

    if (repoFilter) {
      data = data.filter(f => f.repo?.toLowerCase().includes(repoFilter.toLowerCase()));
    }

    // 🔥 FIXED SUMMARY (ROBUST)
    const summary = {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    data.forEach(f => {
      const risk = (f.risk || 'LOW').toUpperCase();

      summary.total++;

      if (risk === 'CRITICAL') summary.critical++;
      else if (risk === 'HIGH') summary.high++;
      else if (risk === 'MEDIUM') summary.medium++;
      else if (risk === 'LOW') summary.low++;
    });

    res.json({
      success: true,
      summary,
      count: data.length,
      data
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📈 Risk Analytics (Chart Ready)
 * GET /dashboard/stats
 */
export const getRiskStats = async (req, res) => {
  try {
    const stats = await mongoService.getRiskStats();

    const formatted = {
      CRITICAL: { total: 0, types: {} },
      HIGH: { total: 0, types: {} },
      MEDIUM: { total: 0, types: {} },
      LOW: { total: 0, types: {} }
    };

    stats.forEach(item => {
      const risk = (item._id.risk || 'LOW').toUpperCase();
      const type = item._id.type;

      if (!formatted[risk]) {
        formatted[risk] = { total: 0, types: {} };
      }

      formatted[risk].total += item.count;
      formatted[risk].types[type] = item.count;
    });

    res.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error('Risk stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🔥 Top High Risk Findings
 * GET /dashboard/top
 */
export const getTopFindings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const data = await mongoService.getDashboardData(100);

    const top = data
      .filter(f => {
        const r = (f.risk || '').toUpperCase();
        return r === 'CRITICAL' || r === 'HIGH';
      })
      .sort((a, b) => (b.entropy || 0) - (a.entropy || 0))
      .slice(0, limit);

    res.json({
      success: true,
      count: top.length,
      data: top
    });

  } catch (error) {
    console.error('Top findings error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📂 Repo-wise stats
 * GET /dashboard/repos
 */
export const getRepoStats = async (req, res) => {
  try {
    const data = await mongoService.getDashboardData(200);

    const repoMap = {};

    data.forEach(f => {
      const repo = f.repo || "unknown";
      const risk = (f.risk || 'LOW').toUpperCase();

      if (!repoMap[repo]) {
        repoMap[repo] = {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        };
      }

      repoMap[repo].total++;

      if (risk === 'CRITICAL') repoMap[repo].critical++;
      else if (risk === 'HIGH') repoMap[repo].high++;
      else if (risk === 'MEDIUM') repoMap[repo].medium++;
      else if (risk === 'LOW') repoMap[repo].low++;
    });

    res.json({
      success: true,
      data: repoMap
    });

  } catch (error) {
    console.error('Repo stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getDashboard,
  getRiskStats,
  getTopFindings,
  getRepoStats
};
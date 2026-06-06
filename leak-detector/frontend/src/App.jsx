import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from "./components/Navbar";
import ResultsGrid from "./components/ResultsGrid";
import StatsBar from "./components/StatsBar";
import ScanButton from "./components/ScanButton";
import Loader from "./components/Loader";
import EmptyState from "./components/EmptyState";

const API = "http://localhost:3001/api";
const DEBOUNCE_DELAY = 500;
const ITEMS_PER_PAGE = 6;

// ── Normalizers ───────────────────────────────────────────────────────────────
const normalizeRisk = (raw) => (raw || "").toString().toLowerCase().trim();
const normalizeType = (raw) => (raw || "").toString().toLowerCase().trim();

// ── Dummy High Priority Alerts ────────────────────────────────────────────────
const DUMMY_ALERTS = [
  {
    _id: "1",
    status: "pending",
    priority: "high",
    retry_count: 0,
    createdAt: "2026-03-24T10:30:00Z",
    finding: {
      masked_key: "AKIA...",
      type: "aws_access_key",
      risk: "HIGH",
      repo: "facebook/react",
      file_path: "src/auth.js"
    }
  },
  {
    _id: "2", 
    status: "failed",
    priority: "high",
    retry_count: 1,
    createdAt: "2026-03-24T09:15:00Z",
    finding: {
      masked_key: "ghp_ABC...",
      type: "github_token",
      risk: "HIGH", 
      repo: "myapp/frontend",
      file_path: "config/env.js"
    }
  },
  {
    _id: "3",
    status: "pending", 
    priority: "high",
    retry_count: 0,
    createdAt: "2026-03-24T08:45:00Z",
    finding: {
      masked_key: "sk_live_...",
      type: "stripe_secret",
      risk: "HIGH",
      repo: "ecommerce/backend",
      file_path: "server.js"
    }
  }
];

export default function App() {
  const [findings, setFindings]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [stats, setStats]         = useState({});
  const [health, setHealth]       = useState({});
  const [repo, setRepo]           = useState("facebook/react");
  const [query, setQuery]         = useState("AKIA");

  // ── Alerts State ─────────────────────────────────────────────────────────────
  const [alerts] = useState(DUMMY_ALERTS);

  // Debounced inputs
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedRepo, setDebouncedRepo]   = useState(repo);

  // Filters & Pagination
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Debounce ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_DELAY);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedRepo(repo), DEBOUNCE_DELAY);
    return () => clearTimeout(t);
  }, [repo]);

  // ── Pre-normalize findings once ───────────────────────────────────────────────
  const normalizedFindings = useMemo(
    () => findings.map((f) => ({
      ...f,
      _risk: normalizeRisk(f.risk),
      _type: normalizeType(f.type),
    })), [findings]
  );

  // ── Filter options ───────────────────────────────────────────────────────────
  const RISK_ORDER = ["critical", "high", "medium", "low"];
  const availableRisks = useMemo(() => {
    const present = new Set(normalizedFindings.map((f) => f._risk).filter(Boolean));
    return ["all", ...RISK_ORDER.filter((r) => present.has(r))];
  }, [normalizedFindings]);

  const availableTypes = useMemo(() => {
    const present = new Set(normalizedFindings.map((f) => f._type).filter(Boolean));
    return ["all", ...Array.from(present).sort()];
  }, [normalizedFindings]);

  // ── Filtering & Pagination ───────────────────────────────────────────────────
  const filteredFindings = useMemo(() => {
    return normalizedFindings.filter((f) => {
      const riskOk = filterRisk === "all" || f._risk === filterRisk;
      const typeOk = filterType === "all" || f._type === filterType;
      return riskOk && typeOk;
    });
  }, [normalizedFindings, filterRisk, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredFindings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFindings = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredFindings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFindings, safePage]);

  const visiblePages = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, safePage - delta);
    const end   = Math.min(totalPages, safePage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  useEffect(() => { setCurrentPage(1); }, [filterRisk, filterType, findings]);

  const goToPage = useCallback((p) => setCurrentPage(p), []);
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // ── Existing functions (unchanged) ───────────────────────────────────────────
  const loadDashboard = async () => {
    try {
      const [findingsRes, dashboardRes, healthRes] = await Promise.all([
        fetch(`${API}/recent?limit=50`),
        fetch(`${API}/dashboard`),
        fetch(`${API}/health`),
      ]);
      const findingsData  = await findingsRes.json();
      const dashboardData = await dashboardRes.json();
      const healthData    = await healthRes.json();

      setFindings(findingsData.data || []);
      const summary = dashboardData.summary || {};
      setStats({
        total:    summary.total    ?? 0,
        critical: summary.critical ?? 0,
        high:     summary.high     ?? 0,
        medium:   summary.medium   ?? 0,
        low:      summary.low      ?? 0,
      });
      setHealth(healthData || {});
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const applyNewFindings = (data) => {
    setFindings(data);
    setFilterRisk("all");
    setFilterType("all");
  };

  const repoScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/scan-repo`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ repo: debouncedRepo }),
      });
      const data = await res.json();
      applyNewFindings(data.data || []);
      loadDashboard();
    } catch (err) {
      console.error("Repo scan failed", err);
    } finally {
      setLoading(false);
    }
  };

  const globalScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/scan`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: debouncedQuery }),
      });
      const data = await res.json();
      applyNewFindings(data.data || []);
      loadDashboard();
    } catch (err) {
      console.error("Global scan failed", err);
    } finally {
      setLoading(false);
    }
  };

  const RISK_PILL = {
    all:      "bg-gray-100 text-gray-600 border-gray-200",
    critical: "bg-purple-100 text-purple-700 border-purple-200",
    high:     "bg-red-100 text-red-600 border-red-200",
    medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
    low:      "bg-green-100 text-green-700 border-green-200",
  };

  const RISK_ACTIVE = {
    all:      "bg-gray-700 text-white border-gray-700",
    critical: "bg-purple-600 text-white border-purple-600",
    high:     "bg-red-500 text-white border-red-500",
    medium:   "bg-yellow-500 text-white border-yellow-500",
    low:      "bg-green-500 text-white border-green-500",
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar
        stats={stats}
        githubStatus={health.services?.github_test}
        mongodbStatus={health.services?.mongodb}
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ── Scan controls ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Global Search & Scan</h3>
              <div className="flex gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && globalScan()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter keyword (AKIA, api_key, password)"
                />
                <ScanButton onClick={globalScan} loading={loading} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Searching for: <span className="font-medium text-gray-600">{debouncedQuery}</span>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Scan Specific Repository</h3>
              <div className="flex gap-3">
                <input
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && repoScan()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="owner/repo (facebook/react)"
                />
                <ScanButton onClick={repoScan} loading={loading} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Repo: <span className="font-medium text-gray-600">{debouncedRepo}</span>
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Overview</h2>
        <StatsBar stats={stats} />

        <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">🎯 Filters & Insights</h2>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700 mr-1">Risk:</span>
            {availableRisks.map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  filterRisk === r ? RISK_ACTIVE[r] : RISK_PILL[r]
                }`}
              >
                {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                {r !== "all" && (
                  <span className="ml-1.5 opacity-75">
                    ({normalizedFindings.filter((f) => f._risk === r).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All types" : t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-500">
              <span className="font-medium text-gray-700">{filteredFindings.length}</span>
              {" "}of{" "}
              <span className="font-medium text-gray-700">{findings.length}</span>
              {" "}results
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400">· page {safePage} of {totalPages}</span>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">📂 Scan Results</h2>
        <div>
          {loading ? (
            <Loader />
          ) : filteredFindings.length > 0 ? (
            <>
              <ResultsGrid results={paginatedFindings} />
              {totalPages > 1 && (
                <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <span className="text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-medium text-gray-700">
                        {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                        {Math.min(safePage * ITEMS_PER_PAGE, filteredFindings.length)}
                      </span>
                      {" "}of{" "}
                      <span className="font-medium text-gray-700">{filteredFindings.length}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={goToPrev}
                        disabled={safePage === 1}
                        className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        ← Prev
                      </button>
                      {visiblePages[0] > 1 && (
                        <>
                          <button onClick={() => goToPage(1)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                            1
                          </button>
                          {visiblePages[0] > 2 && <span className="px-2 text-gray-400 select-none">…</span>}
                        </>
                      )}
                      {visiblePages.map((p) => (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            safePage === p ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      {visiblePages[visiblePages.length - 1] < totalPages && (
                        <>
                          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                            <span className="px-2 text-gray-400 select-none">…</span>
                          )}
                          <button
                            onClick={() => goToPage(totalPages)}
                            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                      <button
                        onClick={goToNext}
                        disabled={safePage === totalPages}
                        className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* ── DUMMY ALERTS SECTION ── */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-3 border-b-2 border-red-100 pb-4">
            🚨 HIGH PRIORITY ALERTS ({alerts.length})
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-red-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-4 h-4 rounded-full ${
                    alert.status === 'pending' ? 'bg-yellow-500' : 
                    alert.status === 'failed' ? 'bg-red-500 animate-pulse' : 
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900 truncate">
                      {alert.finding?.masked_key || 'Secret Alert'}
                    </h4>
                    <p className="text-sm text-gray-600">{alert.finding?.type?.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    alert.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    alert.status === 'failed' ? 'bg-red-200 text-red-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {alert.status?.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p><span className="font-medium">Repo:</span> {alert.finding?.repo}</p>
                  <p><span className="font-medium">File:</span> {alert.finding?.file_path}</p>
                  <p><span className="font-medium">Risk:</span> <span className="text-red-600 font-semibold">{alert.finding?.risk}</span></p>
                  <p><span className="font-medium">Priority:</span> <span className="text-red-600 font-bold">{alert.priority?.toUpperCase()}</span></p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-red-100">
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
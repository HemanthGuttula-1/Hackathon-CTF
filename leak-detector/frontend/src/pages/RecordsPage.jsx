import { useEffect, useState } from "react";
import ResultsGrid from "../components/ResultsGrid";
import StatsBar from "../components/StatsBar";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const API = "http://localhost:3001/api";

export default function RecordsPage() {
  const [data, setData] = useState([]);
  const [risk, setRisk] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  // 🔥 Fetch data (WITH BACKEND FILTERS)
  const fetchData = async () => {
    setLoading(true);

    try {
      let url = `${API}/dashboard?limit=100`;

      if (risk) {
        url += `&risk=${risk}`;
      }

      if (search.trim()) {
        url += `&repo=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      setData(json.data || []);

      const summary = json.summary || {};

      setStats({
        total: summary.total ?? 0,
        critical: summary.critical ?? 0,
        high: summary.high ?? 0,
        medium: summary.medium ?? 0,
        low: summary.low ?? 0
      });

    } catch (err) {
      console.error("Records fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 Re-fetch when filters change (IMPORTANT)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [risk, search]);

  // 🔁 Retry
  const reload = () => {
    fetchData();
  };

  // 🧪 Loading
  if (loading) {
    return <Loader text="Loading records..." />;
  }

  // 📭 Empty
  if (!data.length) {
    return (
      <EmptyState
        title="No Records Found"
        description="Try running a scan or changing filters"
        icon="📂"
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* 🔥 Title */}
      <h2 className="text-2xl font-bold mb-6">
        📂 All Records
      </h2>

      {/* 📊 Stats */}
      <StatsBar
        stats={stats}
        onFilter={(r) => setRisk(r === "ALL" ? "" : r)}
        className="mb-6"
      />

      {/* 🔍 Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by repo..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        {/* Risk */}
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Risks</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

      </div>

      {/* 📊 Results */}
      <ResultsGrid
        results={data}
        emptyTitle="No Matching Records"
        emptyDescription="Try adjusting filters"
        onRetry={reload}
      />
    </div>
  );
}
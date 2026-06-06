import { useEffect, useState } from "react";
import ResultsGrid from "../components/ResultsGrid";
import StatsBar from "../components/StatsBar";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const API = "http://localhost:3001/api";

export default function RecordsPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [risk, setRisk] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  // 🔥 Fetch records
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/dashboard`);
        const json = await res.json();

        const records = json.data || [];
        const summary = json.summary || {};

        setData(records);
        setFiltered(records);

        // ✅ Stats
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

    fetchData();
  }, []);

  // 🔍 Filtering logic
  useEffect(() => {
    let result = [...data];

    // Risk filter
    if (risk && risk !== "ALL") {
      result = result.filter(f => f.risk === risk);
    }

    // Search filter
    if (search) {
      result = result.filter(f =>
        f.repo?.toLowerCase().includes(search.toLowerCase()) ||
        f.type?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [risk, search, data]);

  if (loading) return <Loader text="Loading records..." />;

  if (!data.length) {
    return (
      <EmptyState
        title="No Records Found"
        description="Run scans to populate database"
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
      />

      {/* 🔍 Filters */}
      <div className="flex flex-col md:flex-row gap-4 my-6">

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by repo or type..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        {/* Risk Filter */}
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
        results={filtered}
        emptyTitle="No Matching Records"
        emptyDescription="Try adjusting filters or search"
      />
    </div>
  );
}
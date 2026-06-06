import { useState } from "react";
import ResultsGrid from "../components/ResultsGrid";
import ScanButton from "../components/ScanButton";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const API = "http://localhost:3001/api";

export default function ScanPage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [repo, setRepo] = useState("facebook/react");
  const [query, setQuery] = useState("AKIA");

  // 🌐 Global Scan
  const globalScan = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API}/scan/global?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setFindings(data.data || []);
    } catch (err) {
      console.error("Global scan failed", err);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Repo Scan
  const repoScan = async () => {
    if (!repo.includes("/")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/scan/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo })
      });
      const data = await res.json();
      setFindings(data.data || []);
    } catch (err) {
      console.error("Repo scan failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* 🔥 Title */}
      <h2 className="text-2xl font-bold mb-6">
        🔍 Secret Scanner
      </h2>

      {/* 🧱 Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">

        {/* 🌐 Global Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Global Search</h3>

          <p className="text-sm text-gray-500 mb-4">
            Search secrets across public repositories
          </p>

          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && globalScan()}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="AKIA, api_key, mongodb..."
            />

            <ScanButton
              onClick={globalScan}
              loading={loading}
              text="Search"
              icon="🌐"
            />
          </div>
        </div>

        {/* 🎯 Repo Scan */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Scan Repository</h3>

          <p className="text-sm text-gray-500 mb-4">
            Scan a specific GitHub repository
          </p>

          <div className="flex gap-3">
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && repoScan()}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="owner/repo (facebook/react)"
            />

            <ScanButton
              onClick={repoScan}
              loading={loading}
              text="Scan"
              icon="📦"
            />
          </div>
        </div>

      </div>

      {/* 📊 Results */}
      {loading ? (
        <Loader text="Scanning repositories..." />
      ) : findings.length > 0 ? (
        <ResultsGrid results={findings} />
      ) : (
        <EmptyState
          title="No Scan Results"
          description="Run a global search or scan a repository to detect secrets"
          actionText="Run Global Scan"
          onAction={globalScan}
        />
      )}
    </div>
  );
}
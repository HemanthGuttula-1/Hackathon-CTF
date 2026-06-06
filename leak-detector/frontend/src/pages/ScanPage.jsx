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

  const globalScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/scan/global?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setFindings(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const repoScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/scan/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo })
      });
      const data = await res.json();
      setFindings(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-10">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Global */}
          <div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && globalScan()}
              className="w-full px-4 py-3 border rounded-xl mb-3"
            />
            <ScanButton onClick={globalScan} loading={loading} />
          </div>

          {/* Repo */}
          <div>
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && repoScan()}
              className="w-full px-4 py-3 border rounded-xl mb-3"
            />
            <ScanButton onClick={repoScan} loading={loading} />
          </div>

        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Loader />
      ) : findings.length > 0 ? (
        <ResultsGrid results={findings} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
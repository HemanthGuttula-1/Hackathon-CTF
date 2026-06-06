import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const API = "http://localhost:3001/api";

export default function AnalyticsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/risks`);
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Analytics fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loader text="Generating analytics..." />;

  if (!data.length) {
    return (
      <EmptyState
        title="No Analytics Data"
        description="Run scans to generate analytics"
        icon="📊"
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* 🔥 Page Title */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📊 Analytics Dashboard
      </h2>

      {/* 📊 Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            {/* 🧠 Type */}
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              {item._id || "Unknown"}
            </h3>

            {/* 🔴 Critical */}
            <p className="text-sm text-red-700">
              Critical: <span className="font-bold">{item.critical || 0}</span>
            </p>

            {/* 🔥 High */}
            <p className="text-sm text-red-500">
              High: <span className="font-bold">{item.high || 0}</span>
            </p>

            {/* 🟡 Medium */}
            <p className="text-sm text-yellow-600">
              Medium: <span className="font-bold">{item.medium || 0}</span>
            </p>

            {/* 🟢 Low */}
            <p className="text-sm text-green-600">
              Low: <span className="font-bold">{item.low || 0}</span>
            </p>

            {/* 📊 Entropy */}
            <p className="text-xs text-gray-500 mt-3">
              Avg Entropy:{" "}
              <span className="font-semibold">
                {item.avgEntropy?.toFixed(2) || "0.00"}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
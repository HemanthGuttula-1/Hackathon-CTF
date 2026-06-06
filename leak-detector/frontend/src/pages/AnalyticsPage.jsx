import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const API = "http://localhost:3001/api";

// 🎨 Colors
const COLORS = {
  CRITICAL: "#7f1d1d",
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981"
};

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

  // 🔥 Transform for Pie (risk totals)
  const riskTotals = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  data.forEach(item => {
    riskTotals.CRITICAL += item.critical || 0;
    riskTotals.HIGH += item.high || 0;
    riskTotals.MEDIUM += item.medium || 0;
    riskTotals.LOW += item.low || 0;
  });

  const pieData = Object.keys(riskTotals).map(key => ({
    name: key,
    value: riskTotals[key]
  }));

  // 🔥 Bar chart data
  const barData = data.map(item => ({
    type: item._id,
    critical: item.critical || 0,
    high: item.high || 0,
    medium: item.medium || 0,
    low: item.low || 0
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Title */}
      <h2 className="text-2xl font-bold mb-6">
        📊 Analytics Dashboard
      </h2>

      {/* 🔥 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {pieData.map((item) => (
          <div
            key={item.name}
            className="bg-white border p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-gray-500">{item.name}</p>
            <h2 className="text-xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* 📊 Charts */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* 🥧 Pie Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">Risk Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[entry.name]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 📊 Bar Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">Type-wise Analysis</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="critical" fill="#7f1d1d" />
              <Bar dataKey="high" fill="#ef4444" />
              <Bar dataKey="medium" fill="#f59e0b" />
              <Bar dataKey="low" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
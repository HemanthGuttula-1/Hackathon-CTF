import { useEffect, useState } from "react";

const API = "http://localhost:3001/api";

export default function AnalyticsPage() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch(`${API}/risks`)
      .then(res => res.json())
      .then(d => setStats(d.data || []));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h2 className="text-xl font-bold mb-4">📊 Analytics</h2>

      {stats.map((item) => (
        <div key={item._id} className="mb-4 border p-4 rounded">
          <h3 className="font-semibold">{item._id}</h3>
          <p>Critical: {item.critical}</p>
          <p>High: {item.high}</p>
          <p>Medium: {item.medium}</p>
          <p>Low: {item.low}</p>
        </div>
      ))}
    </div>
  );
}
import { motion } from "framer-motion";

export default function StatsBar({
  stats = {},
  onFilter, // 🔥 optional (click to filter)
  className = ""
}) {
  const total = stats.total ?? 0;
  const critical = stats.critical ?? 0;
  const high = stats.high ?? 0;
  const medium = stats.medium ?? 0;
  const low = stats.low ?? 0;

  const data = [
    {
      label: "Total",
      value: total,
      color: "text-blue-600",
      bg: "bg-blue-50",
      key: "ALL"
    },
    {
      label: "Critical",
      value: critical,
      color: "text-red-700",
      bg: "bg-red-100",
      key: "CRITICAL"
    },
    {
      label: "High",
      value: high,
      color: "text-red-500",
      bg: "bg-red-50",
      key: "HIGH"
    },
    {
      label: "Medium",
      value: medium,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      key: "MEDIUM"
    },
    {
      label: "Low",
      value: low,
      color: "text-green-600",
      bg: "bg-green-50",
      key: "LOW"
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {data.map((stat) => (
        <Stat
          key={stat.label}
          {...stat}
          onClick={() => onFilter && onFilter(stat.key)}
        />
      ))}
    </div>
  );
}

function Stat({ label, value, color, bg, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${bg} border border-gray-200 rounded-xl p-5 shadow-sm 
      hover:shadow-md transition cursor-pointer`}
    >
      <p className="text-sm text-gray-600 mb-1">
        {label}
      </p>

      <h2 className={`text-2xl font-bold ${color}`}>
        {value}
      </h2>
    </motion.div>
  );
}
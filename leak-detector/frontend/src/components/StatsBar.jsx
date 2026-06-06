export default function StatsBar({ stats = {}, className = "" }) {
  // ✅ Correct fields from backend
  const total = stats.total ?? 0;
  const critical = stats.critical ?? 0;
  const high = stats.high ?? 0;
  const medium = stats.medium ?? 0;
  const low = stats.low ?? 0;

  const data = [
    {
      label: "Total Findings",
      value: total,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Critical",
      value: critical,
      color: "text-red-700",
      bg: "bg-red-100"
    },
    {
      label: "High Risk",
      value: high,
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      label: "Medium Risk",
      value: medium,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      label: "Low Risk",
      value: low,
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {data.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function Stat({ label, value, color, bg }) {
  return (
    <div
      className={`${bg} border border-gray-200 rounded-xl p-5 shadow-sm 
      hover:shadow-md transition transform hover:-translate-y-1`}
    >
      <p className="text-sm text-gray-600 mb-1">
        {label}
      </p>

      <h2 className={`text-2xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}
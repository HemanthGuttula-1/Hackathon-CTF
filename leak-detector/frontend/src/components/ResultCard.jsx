import { motion } from "framer-motion";

export default function ResultCard({ item }) {
  if (!item) return null;

  const level = item.risk || "LOW";

  // 🎨 Clean badge styles
  const riskStyles = {
    CRITICAL: "bg-red-100 text-red-700",
    HIGH: "bg-red-50 text-red-600",
    MEDIUM: "bg-yellow-50 text-yellow-700",
    LOW: "bg-green-50 text-green-700",
  };

  const typeIcons = {
    aws_access_key: "🔑",
    aws_secret_key: "🔐",
    stripe: "💳",
    github: "🐙",
    openai: "🤖",
    google_api: "🌐",
    jwt: "🪪",
    private_key: "🛑",
    mongodb_uri: "🗄️",
    mongodb_env: "🗄️",
  };

  const badge = riskStyles[level] || "bg-gray-100 text-gray-700";
  const icon = typeIcons[item.type] || "🔍";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
    >
      {/* 🔝 Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 truncate">
            {item.repo}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {item.file_path}
          </p>
        </div>

        <span className="text-lg">{icon}</span>
      </div>

      {/* 🚨 Risk Badge */}
      <span
        className={`inline-block text-xs px-2 py-1 rounded-md font-medium ${badge}`}
      >
        {level}
      </span>

      {/* 🔑 Secret */}
      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-3 text-xs font-mono break-all">
        {item.masked_key || "No key"}
      </div>

      {/* 🧠 Info */}
      <div className="flex justify-between text-xs text-gray-500 mt-3">
        <span>{item.type}</span>
        <span>
          {item.entropy ? `Entropy: ${item.entropy.toFixed(2)}` : ""}
        </span>
      </div>

      {/* 📋 Copy */}
      <button
        onClick={() => navigator.clipboard.writeText(item.masked_key || "")}
        className="mt-3 text-xs text-blue-600 hover:underline"
      >
        Copy
      </button>
    </motion.div>
  );
}
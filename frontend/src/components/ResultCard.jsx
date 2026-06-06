import { motion } from "framer-motion";

export default function ResultCard({ item }) {
  if (!item) return null;

  const level = (item.risk || "LOW").toUpperCase();

  // 🎨 Risk Colors
  const riskStyles = {
    CRITICAL: "bg-red-700 text-white",
    HIGH: "bg-red-500 text-white",
    MEDIUM: "bg-yellow-400 text-black",
    LOW: "bg-green-500 text-white"
  };

  // 🧠 Icons based on type
  const icons = {
    aws_access_key: "🔑",
    aws_secret_key: "🔐",
    stripe: "💳",
    github: "🐙",
    openai: "🤖",
    google_api: "🌐",
    jwt: "🪪",
    private_key: "🚨",
    mongodb_uri: "🗄️",
    mongodb_env: "🗄️"
  };

  const badge = riskStyles[level] || "bg-gray-500 text-white";
  const icon = icons[item.type] || "🔍";

  // 📋 Copy function
  const handleCopy = () => {
    navigator.clipboard.writeText(item.full_match || item.masked_key || "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
    >
      {/* 🔝 Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-blue-600 truncate">
          {item.repo || "Unknown Repo"}
        </h2>

        <span className="text-lg">{icon}</span>
      </div>

      {/* 📄 File */}
      <p className="text-xs text-gray-500 mb-3 truncate">
        📄 {item.file_path || "Unknown file"}
      </p>

      {/* 🚨 Risk Badge */}
      <span
        className={`px-3 py-1 text-xs rounded-full inline-block mb-3 ${badge}`}
      >
        {level}
      </span>

      {/* 🔑 Key */}
      <div className="bg-black p-3 rounded-lg text-xs break-all max-h-24 overflow-auto">
        <p className="text-green-400 font-mono">
          {item.masked_key || "No key"}
        </p>
      </div>

      {/* 🧠 Context */}
      {item.context && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {item.context}
        </p>
      )}

      {/* 📊 Footer */}
      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
        <span>Type: {item.type}</span>

        <span>
          Entropy:{" "}
          {item.entropy ? item.entropy.toFixed(2) : "N/A"}
        </span>
      </div>

      {/* 📋 Copy Button */}
      <button
        onClick={handleCopy}
        className="mt-3 w-full text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Copy Key
      </button>
    </motion.div>
  );
}
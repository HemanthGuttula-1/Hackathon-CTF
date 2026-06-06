import { motion } from "framer-motion";

export default function EmptyState({ onScan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-md mx-auto"
    >
      {/* Icon */}
      <div className="text-5xl mb-4">🔍</div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        No results yet
      </h2>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-6">
        Start a scan to detect exposed secrets in public repositories.
      </p>

      {/* Button */}
      <button
        onClick={onScan}
        className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium 
        hover:bg-blue-700 transition"
      >
        Start Scan
      </button>

      {/* Hint */}
      <p className="text-xs text-gray-400 mt-4">
        Try: facebook/react
      </p>
    </motion.div>
  );
}
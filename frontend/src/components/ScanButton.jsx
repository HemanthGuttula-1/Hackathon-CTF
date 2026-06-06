import { motion } from "framer-motion";

export default function ScanButton({
  onClick,
  loading = false,
  text = "Scan",
  loadingText = "Scanning...",
  icon = "🚀",
  className = ""
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: loading ? 1 : 1.05 }}
      onClick={onClick}
      disabled={loading}
      className={`
        flex items-center justify-center gap-2
        px-5 py-3 rounded-xl font-medium
        transition-all duration-300
        ${loading
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
        }
        ${className}
      `}
    >
      {/* 🔄 Loading Spinner */}
      {loading ? (
        <motion.span
          className="inline-block"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          🔄
        </motion.span>
      ) : (
        <span>{icon}</span>
      )}

      {/* 📝 Text */}
      <span>
        {loading ? loadingText : text}
      </span>
    </motion.button>
  );
}
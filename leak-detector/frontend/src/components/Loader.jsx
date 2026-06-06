import { motion } from "framer-motion";

export default function Loader({ message = "Scanning repositories..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />

      {/* Message */}
      <p className="text-sm text-gray-600">
        {message}
      </p>
    </motion.div>
  );
}
import { motion } from "framer-motion";

export default function Loader({ text = "Scanning repositories..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      
      {/* 🔄 Animated Icon */}
      <motion.div
        className="text-6xl mb-6"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        🔍
      </motion.div>

      {/* 📡 Text */}
      <p className="text-lg text-gray-600 font-mono mb-6">
        {text}
      </p>

      {/* ⚡ Animated Dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-blue-500 rounded-full"
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.2,
              repeat: Infinity
            }}
          />
        ))}
      </div>
    </div>
  );
}
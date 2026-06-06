import { motion } from "framer-motion";

export default function Navbar({ githubStatus, mongodbStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-900/90 to-black/50 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl"
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left - Logo */}
        <motion.div 
          className="flex items-center gap-4 group"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.span 
            className="text-3xl group-hover:rotate-12 transition-transform duration-300"
            initial={{ rotate: 0 }}
            animate={{ rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            🔐
          </motion.span>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              Secret Scanner
            </h1>
            <p className="text-xs text-gray-400 font-medium hidden md:block">
              GitHub Secret Detection
            </p>
          </div>
        </motion.div>

        {/* Right - Status Indicators */}
        <div className="flex items-center gap-3">
          {/* GitHub Status */}
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 backdrop-blur-sm text-sm font-medium transition-all duration-300 hover:scale-105 ${
              githubStatus === "✅ working"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/25 shadow-lg"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/25 shadow-lg"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span 
              className="w-3 h-3 rounded-full bg-current animate-pulse"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
            GitHub
          </motion.div>

          {/* MongoDB Status */}
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 backdrop-blur-sm text-sm font-medium transition-all duration-300 hover:scale-105 ${
              mongodbStatus === "connected"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/25 shadow-lg"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/25 shadow-lg"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span 
              className="w-3 h-3 rounded-full bg-current animate-pulse"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            />
            DB
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
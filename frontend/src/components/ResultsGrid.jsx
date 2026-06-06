import { motion, AnimatePresence } from "framer-motion";
import ResultCard from "./ResultCard";
import EmptyState from "./EmptyState";
import Loader from "./Loader";

export default function ResultsGrid({
  results = [],
  isLoading = false,
  onRetry,
  emptyTitle,
  emptyDescription
}) {
  const hasResults = results && results.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {/* 📱 Grid Layout */}
      <div
        className={`grid gap-6 transition-all duration-300 ${
          hasResults
            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        <AnimatePresence>

          {/* 🔄 Loader */}
          {isLoading && (
            <motion.div
              key="loading"
              className="col-span-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader />
            </motion.div>
          )}

          {/* 📭 Empty State */}
          {!isLoading && !hasResults && (
            <motion.div
              key="empty"
              className="col-span-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <EmptyState
                title={emptyTitle || "No Results Found"}
                description={
                  emptyDescription ||
                  "Run a scan or adjust filters to see results"
                }
                onAction={onRetry}
                actionText="Try Again"
              />
            </motion.div>
          )}

          {/* 📊 Results */}
          {!isLoading &&
            hasResults &&
            results.map((item) => (
              <motion.div
                key={`${item.repo}-${item.file_path}-${item.masked_key}`}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9
                }}
              >
                <ResultCard item={item} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* 📊 Footer */}
      {!isLoading && hasResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm text-gray-600 shadow-sm">
            <span>📊 Showing {results.length} results</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
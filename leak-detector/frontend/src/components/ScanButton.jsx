import { motion } from 'framer-motion';

export default function ScanButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium 
      hover:bg-blue-700 transition duration-200 
      disabled:opacity-50"
      disabled={loading}
    >
      {loading ? "Scanning..." : "Scan"}
    </button>
  );
}
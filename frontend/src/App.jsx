import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import ScanPage from "./pages/ScanPage";
import RecordsPage from "./pages/RecordsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </div>
  );
}
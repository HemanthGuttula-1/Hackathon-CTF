import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between">
      <h1 className="font-bold text-xl">🔐 Secret Scanner</h1>

      <div className="flex gap-6">
        <Link to="/" className="hover:text-blue-600">Scan</Link>
        <Link to="/records" className="hover:text-blue-600">Records</Link>
        <Link to="/analytics" className="hover:text-blue-600">Analytics</Link>
      </div>
    </div>
  );
}
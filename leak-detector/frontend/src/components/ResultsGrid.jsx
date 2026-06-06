// ResultsGrid.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PURE display component.
// Renders ONLY props.results — no internal state, no fetching, no filtering.
// All filtering and pagination is done in App.jsx before this receives data.
// ─────────────────────────────────────────────────────────────────────────────

const RISK_BADGE = {
  critical: "bg-purple-100 text-purple-700 border border-purple-200",
  high:     "bg-red-100    text-red-600    border border-red-200",
  medium:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  low:      "bg-green-100  text-green-700  border border-green-200",
};

function RiskBadge({ risk }) {
  const key   = (risk || "").toLowerCase().trim();
  const style = RISK_BADGE[key] || "bg-gray-100 text-gray-500 border border-gray-200";
  return (
    <span className={`inline-block text-xs font-bold px-2 py-1 rounded ${style}`}>
      {(risk || "UNKNOWN").toUpperCase()}
    </span>
  );
}

export default function ResultsGrid({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((finding) => (
        <div
          key={finding._id}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3
            hover:shadow-md hover:border-gray-300 transition-all"
        >
          {/* Repo + file + link */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                {finding.repo || "Unknown repo"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {finding.file || finding.filename || ""}
              </p>
            </div>
            {finding.url && (
              <a
                href={finding.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0 text-base"
                title="View on GitHub"
              >
                🔍
              </a>
            )}
          </div>

          {/* Risk badge */}
          <RiskBadge risk={finding.risk} />

          {/* Masked key */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            <code className="text-sm text-gray-700 font-mono break-all">
              {finding.masked_key || "—"}
            </code>
          </div>

          {/* Type + entropy */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-medium text-gray-500">
              {finding.type || "unknown"}
            </span>
            {finding.entropy != null && (
              <span>Entropy: {Number(finding.entropy).toFixed(2)}</span>
            )}
          </div>

          {/* Copy */}
          {finding.masked_key && (
            <button
              onClick={() => navigator.clipboard?.writeText(finding.masked_key)}
              className="text-xs text-blue-500 hover:text-blue-700 text-left
                transition-colors w-fit"
            >
              Copy
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

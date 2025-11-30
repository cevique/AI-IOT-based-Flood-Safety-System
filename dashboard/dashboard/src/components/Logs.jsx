import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Logs() {
  // ---------------------------
  // States and URL Params
  // ---------------------------
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const rowsPerPage = 10;
  const controllerRef = useRef(null);

  // Read filters from URL, default to "all"
  const filterDate = searchParams.get("filter") || "all";
  const filterStatus = searchParams.get("status") || "all";

  // ---------------------------
  // Helper: Update URL params
  // ---------------------------
  const setFilterDate = (value) => {
    searchParams.set("filter", value);
    setSearchParams(searchParams);
    setCurrentPage(1);
  };
  const setFilterStatus = (value) => {
    searchParams.set("status", value);
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // ---------------------------
  // Helper: Format timestamp safely
  // ---------------------------
const formatTimestamp = (ts) => {
  if (!ts) return "Invalid";
  const ms = ts.toString().length === 13 ? ts : ts * 1000;
  return new Date(ms).toLocaleString("en-US", {
    timeZone: "Asia/Karachi", // UTC+5
    hour12: false,
  });
};


  // ---------------------------
  // Helper: Download logs as CSV
  // ---------------------------
  const downloadLogsAsCSV = async () => {
    setIsDownloading(true);
    toast.info("Preparing your download...");
    try {
      const headers = ["Time", "Distance (cm)", "Status"];
      const csvRows = [
        headers.join(","),
        ...logs.map((log) =>
          [
            formatTimestamp(log.timestamp),
            log.distance,
            log.status,
          ].join(",")
        ),
      ];
      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download logs.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ---------------------------
  // Fetch Logs Function
  // ---------------------------
  const fetchLogs = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = new AbortController();
      const query = new URLSearchParams({
        filter: filterDate,
        status: filterStatus,
      }).toString();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs?${query}`, {
        signal: controllerRef.current.signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);
      const data = await res.json();
      setLogs(data);
      setLastUpdate(new Date());
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Logs fetch error:", err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ---------------------------
  // Fetch logs on filter change
  // ---------------------------
  useEffect(() => {
    fetchLogs({ silent: false });
  }, [filterDate, filterStatus]);

  // ---------------------------
  // Auto-refresh every 3s (silent, does not affect filters)
  // ---------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs({ silent: true });
    }, 3000);
    return () => {
      clearInterval(interval);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [filterDate, filterStatus]);

  // ---------------------------
  // Pagination logic
  // ---------------------------
  const totalPages = Math.ceil(logs.length / rowsPerPage);
  const currentRows = logs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-green-600 font-medium">LIVE</span>
        </div>
      </div>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="p-2 border rounded"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
        </select>
        <select
          className="p-2 border rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Safe">Safe</option>
          <option value="Warning">Warning</option>
          <option value="Severe">Severe</option>
        </select>
      </div>
      {/* Download Button */}
      <div className="mb-4">
        <button
          onClick={downloadLogsAsCSV}
          disabled={isDownloading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
        >
          {isDownloading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Preparing...
            </>
          ) : (
            "Download Older Data"
          )}
        </button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 font-semibold text-gray-700">Time</th>
              <th className="p-3 font-semibold text-gray-700">Distance (cm)</th>
              <th className="p-3 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Loading logs...
                </td>
              </tr>
            ) : currentRows.length > 0 ? (
              currentRows.map((log, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatTimestamp(log.timestamp)}</td>
                  <td className="p-3">{log.distance}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-bold ${
                        log.status === "Severe"
                          ? "bg-red-100 text-red-700"
                          : log.status === "Warning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {logs.length > rowsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 border rounded ${
                currentPage === page ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

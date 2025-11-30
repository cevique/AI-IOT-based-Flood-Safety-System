import { useState, useEffect } from "react";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const query = new URLSearchParams({
          filter: filterDate,
          status: filterStatus,
        });
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs?${query}`);
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, [filterDate, filterStatus]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">System Logs</h2>

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
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(log.timestamp * 1000).toLocaleString()}
                  </td>
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
    </div>
  );
}

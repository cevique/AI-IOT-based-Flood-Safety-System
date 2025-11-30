import { useState, useEffect } from "react";

export default function AIAnalytics() {
  const [analytics, setAnalytics] = useState({
    median: 0,
    trend: "Loading...",
    slope: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();
        setAnalytics(data);
        setLastUpdate(new Date());
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 2000);
    return () => clearInterval(interval);
  }, []);

  const cardBase =
    "bg-white shadow-md p-6 text-center rounded-lg transition-transform duration-500 hover:scale-105 hover:shadow-xl";

  const isInsufficientData = analytics.trend === "Insufficient Data";

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI Analytics</h2>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
          {!loading && lastUpdate && (
            <span className="text-xs text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">⚠️ Error: {error}</p>
        </div>
      )}

      {isInsufficientData && !loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            📊 Collecting data... Analytics will be available once sufficient sensor readings are gathered.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Median Distance */}
        <div className={`${cardBase} border-t-4 border-blue-500`}>
          <h3 className="font-bold text-lg text-gray-600 mb-2">Median Distance</h3>
          <p className="text-4xl font-bold text-blue-600">
            {loading ? "..." : `${analytics.median} cm`}
          </p>
          <p className="text-sm text-gray-400 mt-2">Last 100 readings</p>
        </div>

        {/* Trend Description */}
        <div className={`${cardBase} border-t-4 border-purple-500`}>
          <h3 className="font-bold text-lg text-gray-600 mb-2">Water Level Trend</h3>
          <p className="text-xl font-bold text-purple-600">
            {loading ? "Calculating..." : analytics.trend}
          </p>
          <p className="text-sm text-gray-400 mt-2">Based on Linear Regression</p>
        </div>

        {/* Slope Metric */}
        <div className={`${cardBase} border-t-4 border-indigo-500`}>
          <h3 className="font-bold text-lg text-gray-600 mb-2">Regression Slope</h3>
          <p className="text-4xl font-bold text-indigo-600">
            {loading ? "..." : analytics.slope.toFixed(4)}
          </p>
          <p className="text-sm text-gray-400 mt-2">Rate of change</p>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-lg text-gray-700 mb-2">How it works</h3>
        <p className="text-gray-600">
          The system uses a <strong>Linear Regression Model</strong> (from Scikit-Learn) to analyze the last 20 sensor readings. 
          It calculates the slope of the trend line to determine if the water level is rising (distance decreasing), 
          receding (distance increasing), or stable. The Median filter is applied to the last 100 readings to provide a noise-free estimate of the current water level.
        </p>
      </div>
    </div>
  );
}

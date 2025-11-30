import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import DashboardCards from "./components/DashboardCards";
import DistanceChart from "./components/DistanceChart";

function App() {
  const [distance, setDistance] = useState(30);
  const [floodCase, setFloodCase] = useState("Safe");
  const [override, setOverride] = useState(false);
  const [history, setHistory] = useState(Array(10).fill(50));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
  let isMounted = true; // to avoid state updates after unmount
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      // Fetch Status
      const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/api/status`, { signal: controller.signal });
      if (!statusRes.ok) throw new Error("Status fetch failed");
      const statusData = await statusRes.json();

      if (isMounted && statusData) {
        if (typeof statusData.distance !== "undefined") setDistance(statusData.distance);
        if (typeof statusData.status !== "undefined") setFloodCase(statusData.status);

        // if you want counts too:
        // setNormalCount(statusData.normalCount ?? statusData.counts?.normal ?? 0)
      }

      // Fetch History
      const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, { signal: controller.signal });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (isMounted && Array.isArray(historyData)) {
          setHistory(historyData);
        }
      }

    } catch (error) {
      if (error.name === "AbortError") {
        // normal on unmount or abort
      } else {
        console.error("Error fetching data:", error);
      }
    }
  };

  // Initial fetch
  fetchData();

  // Poll every 1.5s
  const interval = setInterval(fetchData, 1500);

  return () => {
    isMounted = false;
    controller.abort(); // cancel outstanding fetch
    clearInterval(interval);
  };
}, []);


  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        override={override}
        setOverride={setOverride}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          className="text-white bg-purple-700 p-2 rounded shadow-lg"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          ☰
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-full md:max-w-4xl mx-auto">
        <DashboardCards distance={distance} floodCase={floodCase} />
        <DistanceChart history={history} />
      </div>
    </div>
  );
}

export default App;

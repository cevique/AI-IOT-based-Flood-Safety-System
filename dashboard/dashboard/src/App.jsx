import { client } from "./mqtt";
import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import DashboardCards from "./components/DashboardCards";
import ProbabilityBar from "./components/ProbabilityBar";
import DistanceChart from "./components/DistanceChart";

function App() {
  const [distance, setDistance] = useState(30);
  const [floodCase, setFloodCase] = useState("Normal");
  const [override, setOverride] = useState(false);
  const [probability, setProbability] = useState(10);
  const [history, setHistory] = useState(Array(10).fill(50));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    client.on("connect", () => {
      console.log("MQTT connected!");
      client.subscribe("esp32/esp32-01/telemetry");
      client.subscribe("laptop/ai/esp32-01/result");
    });

    client.on("message", (topic, message) => {
      const payload = JSON.parse(message.toString());
      if (topic === "esp32/esp32-01/telemetry") {
        setDistance(payload.distance);
        setFloodCase(payload.status);
        setHistory((prev) => [...prev.slice(1), payload.distance]);
      } else if (topic === "laptop/ai/esp32-01/result") {
        setProbability(payload.flood_probability);
      }
    });

    return () => client.end();
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
        <ProbabilityBar probability={probability} />
        <DistanceChart history={history} />
      </div>
    </div>
  );
}

export default App;

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function DistanceChart({ history }) {
  const data = {
    labels: history.map((_, i) => i + 1),
    datasets: [
      {
        label: "Distance",
        data: history,
        borderColor: "#6366f1", // blue-purple
        backgroundColor: "rgba(99,102,241,0.3)",
        tension: 0.4, // smooth curve
        fill: true,
      },
    ],
  };

  return (
    <div className="relative bg-white shadow-md p-4 rounded max-w-full md:max-w-4xl mx-auto mb-4 overflow-hidden">
      <Line data={data} />
      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400 animate-sparkle"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 90 + 5}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

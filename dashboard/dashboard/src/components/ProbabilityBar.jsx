export default function ProbabilityBar({ probability }) {
  return (
    <div className="my-4 max-w-full md:max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-black">
        Flood Probability
      </h2>
      <div className="w-full bg-black rounded-full h-5 overflow-hidden">
        <div
          className={`h-5 rounded-full transition-all duration-1000 animate-pulse-slow ${
            probability > 70
              ? "bg-red-500 shadow-lg shadow-red-400/50"
              : probability > 40
              ? "bg-yellow-400 shadow-lg shadow-yellow-300/50"
              : "bg-purple-600 shadow-lg shadow-purple-400/50"
          }`}
          style={{ width: `${probability}%` }}
        ></div>
      </div>
      <p className="text-center mt-1 font-bold text-black text-sm">
        {probability}%
      </p>
    </div>
  );
}

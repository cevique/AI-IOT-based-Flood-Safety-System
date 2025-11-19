export default function DashboardCards({ distance, floodCase }) {
  const cardBase =
    "bg-white shadow-md p-4 text-center rounded-lg transition-transform duration-500 hover:scale-105 hover:shadow-xl animate-pulse-slow";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Distance Card */}
      <div className={`${cardBase} border-t-4 border-blue-500`}>
        <h2 className="font-bold text-lg">Distance</h2>
        <p className="text-2xl">{distance} cm</p>
      </div>

      {/* Flood Case Card */}
      <div
        className={`${cardBase} border-t-4 ${
          floodCase === "Critical"
            ? "border-red-500"
            : floodCase === "Warning"
            ? "border-yellow-500"
            : "border-green-500"
        }`}
      >
        <h2 className="font-bold text-lg">Flood Case</h2>
        <p className="text-2xl">{floodCase}</p>
      </div>
    </div>
  );
}

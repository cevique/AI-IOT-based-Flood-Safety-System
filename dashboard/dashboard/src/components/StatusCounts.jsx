export default function StatusCounts({ counts }) {
  const cardBase =
    "bg-white shadow-md p-4 text-center rounded-lg transition-transform duration-500 hover:scale-105 hover:shadow-xl";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* Normal Count */}
      <div className={`${cardBase} border-t-4 border-green-500`}>
        <h2 className="font-bold text-lg text-gray-700">Safe Count</h2>
        <p className="text-2xl font-bold text-green-600">{counts.normal}</p>
      </div>

      {/* Warning Count */}
      <div className={`${cardBase} border-t-4 border-yellow-500`}>
        <h2 className="font-bold text-lg text-gray-700">Warning Count</h2>
        <p className="text-2xl font-bold text-yellow-600">{counts.warning}</p>
      </div>

      {/* Severe Count */}
      <div className={`${cardBase} border-t-4 border-red-500`}>
        <h2 className="font-bold text-lg text-gray-700">Severe Count</h2>
        <p className="text-2xl font-bold text-red-600">{counts.severe}</p>
      </div>
    </div>
  );
}

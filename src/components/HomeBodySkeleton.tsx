export default function HomebodySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

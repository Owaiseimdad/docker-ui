interface StatsCardProps {
  title: string;
  value: number | string;
  bgColor: string; // e.g., "from-blue-500 to-blue-600"
  icon: React.ReactNode;
}

export default function StatsCard({ title, value, bgColor, icon }: StatsCardProps) {
  return (
    <div className={`bg-gradient-to-r ${bgColor} rounded-2xl p-6 text-white shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  trend?: { value: string; up?: boolean };
}

export function MetricCard({ label, value, icon, color = "#4285F4", trend }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#757575] font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg" style={{ color }}>{icon}</span>}
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trend.up ? "text-[#0F9D58]" : "text-[#E94335]"}`}>
          {trend.up ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </div>
  );
}

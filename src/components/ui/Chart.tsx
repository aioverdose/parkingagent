interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export function BarChart({ data, height = 48, className = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={`flex items-end gap-2 ${className}`} style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#BDBDBD] font-medium">{d.value}</span>
          <div className="w-full rounded-t-md transition-all hover:opacity-80"
            style={{ height: `${(d.value / max) * 100}%`, backgroundColor: d.color || "#4285F4", minHeight: 4 }} />
          <span className="text-[10px] text-[#757575] font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PieChart({ data, size = 80 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 1);
  const radius = size / 2 - 4;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="shrink-0">
        {data.map((d) => {
          const pct = d.value / total;
          const dash = pct * circ;
          const seg = (
            <circle key={d.label} cx={size / 2} cy={size / 2} r={radius} fill="none"
              stroke={d.color} strokeWidth={6} strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          );
          offset += dash;
          return seg;
        })}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eee" strokeWidth={6}
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={0} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="space-y-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[#757575]">{d.label}</span>
            <span className="font-semibold text-[#202124]">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

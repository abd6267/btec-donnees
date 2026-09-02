type StatCardProps = {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  value: string | number;
  label: string;
  sub?: string;
  color: string;
  onClick?: () => void;
  active?: boolean;
};

export default function StatCard({ icon: Icon, value, label, sub, color, onClick, active }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3.5 flex items-center gap-3 border transition-colors ${
        onClick ? "cursor-pointer hover:bg-slate-50" : ""
      } ${active ? "border-slate-300 ring-1 ring-slate-200" : "border-slate-200"}`}
    >
      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
        <Icon size={20} className="text-white" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-900 text-xl font-bold leading-none">{value}</p>
        <p className="text-slate-500 text-[11px] mt-1 leading-tight">{label}</p>
        {sub && <p className="text-emerald-600 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
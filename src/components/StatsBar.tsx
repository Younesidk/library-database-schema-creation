import React from "react";
import { tables, relationships, tableGroups } from "../data/schema";

const groupColorMap: Record<string, string> = {
  indigo: "bg-indigo-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
};

export const StatsBar: React.FC = () => {
  const totalColumns = tables.reduce((acc, t) => acc + t.columns.length, 0);
  const totalFK = tables.reduce((acc, t) => acc + t.columns.filter((c) => c.isFK).length, 0);

  return (
    <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-white/5 border-b border-white/10 text-sm">
      {/* Stats */}
      <div className="flex items-center gap-6 flex-wrap">
        <Stat icon="🗄️" label="Tables" value={tables.length} />
        <Stat icon="📊" label="Columns" value={totalColumns} />
        <Stat icon="🔗" label="FK Relations" value={relationships.length} />
        <Stat icon="🔑" label="Foreign Keys" value={totalFK} />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/20 hidden md:block" />

      {/* Groups */}
      <div className="flex items-center gap-3 flex-wrap">
        {tableGroups.map((g) => (
          <div key={g.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${groupColorMap[g.color] || "bg-gray-500"}`}></span>
            <span className="text-white/60 text-xs">{g.label}</span>
            <span className="text-white/40 text-xs">({g.tables.length})</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 ml-auto flex-wrap">
        <LegendItem icon="🔑" label="Primary Key" />
        <LegendItem icon="🔗" label="Foreign Key" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">1:N</span>
          <span className="text-white/50 text-xs">One-to-Many</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">1:1</span>
          <span className="text-white/50 text-xs">One-to-One</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">M:N</span>
          <span className="text-white/50 text-xs">Many-to-Many</span>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: string; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    <span>{icon}</span>
    <div>
      <div className="text-white font-bold text-sm leading-none">{value}</div>
      <div className="text-white/40 text-[10px]">{label}</div>
    </div>
  </div>
);

const LegendItem: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-sm">{icon}</span>
    <span className="text-white/50 text-xs">{label}</span>
  </div>
);

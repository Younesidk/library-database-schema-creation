import React, { useState } from "react";
import { TableType } from "../data/schema";

const colorMap: Record<string, { bg: string; border: string; header: string; badge: string; pk: string; fk: string; dot: string }> = {
  indigo: { bg: "bg-indigo-950/60", border: "border-indigo-500/50", header: "bg-indigo-600", badge: "bg-indigo-500/20 text-indigo-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-indigo-400" },
  violet: { bg: "bg-violet-950/60", border: "border-violet-500/50", header: "bg-violet-600", badge: "bg-violet-500/20 text-violet-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-violet-400" },
  blue: { bg: "bg-blue-950/60", border: "border-blue-500/50", header: "bg-blue-700", badge: "bg-blue-500/20 text-blue-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30", dot: "bg-blue-400" },
  cyan: { bg: "bg-cyan-950/60", border: "border-cyan-500/50", header: "bg-cyan-700", badge: "bg-cyan-500/20 text-cyan-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-cyan-400" },
  slate: { bg: "bg-slate-800/80", border: "border-slate-500/50", header: "bg-slate-600", badge: "bg-slate-500/20 text-slate-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-slate-400" },
  amber: { bg: "bg-amber-950/60", border: "border-amber-500/50", header: "bg-amber-700", badge: "bg-amber-500/20 text-amber-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-amber-400" },
  orange: { bg: "bg-orange-950/60", border: "border-orange-500/50", header: "bg-orange-700", badge: "bg-orange-500/20 text-orange-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-orange-400" },
  yellow: { bg: "bg-yellow-950/60", border: "border-yellow-500/50", header: "bg-yellow-700", badge: "bg-yellow-500/20 text-yellow-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-yellow-400" },
  green: { bg: "bg-green-950/60", border: "border-green-500/50", header: "bg-green-700", badge: "bg-green-500/20 text-green-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-green-400" },
  purple: { bg: "bg-purple-950/60", border: "border-purple-500/50", header: "bg-purple-700", badge: "bg-purple-500/20 text-purple-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-purple-400" },
  rose: { bg: "bg-rose-950/60", border: "border-rose-500/50", header: "bg-rose-700", badge: "bg-rose-500/20 text-rose-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-rose-400" },
  teal: { bg: "bg-teal-950/60", border: "border-teal-500/50", header: "bg-teal-700", badge: "bg-teal-500/20 text-teal-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-teal-400" },
  pink: { bg: "bg-pink-950/60", border: "border-pink-500/50", header: "bg-pink-700", badge: "bg-pink-500/20 text-pink-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-pink-400" },
  red: { bg: "bg-red-950/60", border: "border-red-500/50", header: "bg-red-700", badge: "bg-red-500/20 text-red-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-red-400" },
  fuchsia: { bg: "bg-fuchsia-950/60", border: "border-fuchsia-500/50", header: "bg-fuchsia-700", badge: "bg-fuchsia-500/20 text-fuchsia-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-fuchsia-400" },
  lime: { bg: "bg-lime-950/60", border: "border-lime-500/50", header: "bg-lime-700", badge: "bg-lime-500/20 text-lime-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-lime-400" },
  sky: { bg: "bg-sky-950/60", border: "border-sky-500/50", header: "bg-sky-700", badge: "bg-sky-500/20 text-sky-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-sky-400" },
  stone: { bg: "bg-stone-800/80", border: "border-stone-500/50", header: "bg-stone-600", badge: "bg-stone-500/20 text-stone-300", pk: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", fk: "bg-blue-500/20 text-blue-300 border border-blue-500/30", dot: "bg-stone-400" },
};

interface TableCardProps {
  table: TableType;
  isHighlighted: boolean;
  isRelated: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onColumnHover: (col: string | null) => void;
  highlightedColumn?: string | null;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  isHighlighted,
  isRelated,
  isDimmed,
  onClick,
  onColumnHover,
  highlightedColumn,
}) => {
  const [expanded, setExpanded] = useState(true);
  const c = colorMap[table.color] || colorMap.slate;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      className={`
        rounded-xl border backdrop-blur-sm transition-all duration-300 overflow-hidden cursor-pointer select-none
        ${c.bg} ${c.border}
        ${isHighlighted ? "ring-2 ring-white/60 shadow-2xl scale-[1.02]" : ""}
        ${isRelated ? "ring-1 ring-white/30 shadow-lg" : ""}
        ${isDimmed ? "opacity-30 scale-[0.98]" : "opacity-100"}
      `}
      onClick={handleClick}
    >
      {/* Header */}
      <div className={`${c.header} px-3 py-2.5 flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{table.icon}</span>
          <span className="font-mono font-bold text-white text-sm truncate">{table.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.badge}`}>
            {table.columns.length} cols
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-white/70 hover:text-white transition-colors text-xs"
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 py-1.5 border-b border-white/5">
        <p className="text-[10px] text-white/50 leading-tight">{table.description}</p>
      </div>

      {/* Columns */}
      {expanded && (
        <div className="divide-y divide-white/5">
          {table.columns.map((col) => (
            <div
              key={col.name}
              className={`
                px-3 py-1.5 flex items-start justify-between gap-2 group transition-colors
                ${highlightedColumn === col.name ? "bg-white/10" : "hover:bg-white/5"}
              `}
              onMouseEnter={() => onColumnHover(col.name)}
              onMouseLeave={() => onColumnHover(null)}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {col.isPK && (
                  <span title="Primary Key" className="text-yellow-400 text-[10px] font-bold shrink-0">🔑</span>
                )}
                {col.isFK && !col.isPK && (
                  <span title="Foreign Key" className="text-blue-400 text-[10px] shrink-0">🔗</span>
                )}
                {!col.isPK && !col.isFK && (
                  <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${c.dot}`}></span>
                )}
                <span className={`font-mono text-[11px] truncate ${col.isPK ? "text-yellow-200 font-semibold" : col.isFK ? "text-blue-200" : "text-white/80"}`}>
                  {col.name}
                </span>
              </div>
              <div className="flex flex-wrap justify-end gap-1 shrink-0">
                <span className="font-mono text-[9px] text-white/40 bg-white/5 px-1 rounded">
                  {col.type}
                </span>
                {col.constraints.map((c2, i) => (
                  <span key={i} className="text-[9px] text-white/30 bg-white/5 px-1 rounded hidden group-hover:inline">
                    {c2}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from "react";
import { RelationshipType, TableType, getRelationshipLabels } from "../data/schema";

interface RelationshipPanelProps {
  selectedTable: string | null;
  tables: TableType[];
  relationships: RelationshipType[];
  onSelectTable: (id: string) => void;
  onClose: () => void;
}

const relBadge: Record<string, string> = {
  "one-to-many": "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  "one-to-one": "bg-green-500/20 text-green-300 border border-green-500/30",
  "many-to-many": "bg-orange-500/20 text-orange-300 border border-orange-500/30",
};

export const RelationshipPanel: React.FC<RelationshipPanelProps> = ({
  selectedTable,
  tables,
  relationships,
  onSelectTable,
  onClose,
}) => {
  if (!selectedTable) return null;

  const table = tables.find((t) => t.id === selectedTable);
  if (!table) return null;

  const outgoing = relationships.filter((r) => r.from === selectedTable);
  const incoming = relationships.filter((r) => r.to === selectedTable);

  const getTable = (id: string) => tables.find((t) => t.id === id);

  return (
    <div className="w-80 shrink-0 bg-gray-900/90 border-l border-white/10 flex flex-col overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{table.icon}</span>
          <div>
            <div className="font-mono font-bold text-white text-sm">{table.name}</div>
            <div className="text-white/40 text-[10px]">{table.columns.length} columns · {outgoing.length + incoming.length} relations</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-lg leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Columns */}
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Columns</h3>
          <div className="space-y-1">
            {table.columns.map((col) => (
              <div key={col.name} className="flex items-center justify-between gap-2 py-1 px-2 rounded bg-white/5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {col.isPK && <span className="text-[10px]">🔑</span>}
                  {col.isFK && !col.isPK && <span className="text-[10px]">🔗</span>}
                  {!col.isPK && !col.isFK && <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0 inline-block" />}
                  <span className={`font-mono text-[11px] truncate ${col.isPK ? "text-yellow-200 font-semibold" : col.isFK ? "text-blue-200" : "text-white/70"}`}>
                    {col.name}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-white/30 bg-white/5 px-1 rounded shrink-0">{col.type}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Outgoing FKs */}
        {outgoing.length > 0 && (
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">
              References → ({outgoing.length})
            </h3>
            <div className="space-y-2">
              {outgoing.map((r, i) => {
                const target = getTable(r.to);
                const labels = getRelationshipLabels(r, tables);
                return (
                  <button
                    key={i}
                    onClick={() => onSelectTable(r.to)}
                    className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{target?.icon}</span>
                        <span className="font-mono text-xs text-white/80 group-hover:text-white transition-colors">
                          {r.to}
                        </span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${relBadge[r.type]}`}>
                        {labels.from} : {labels.to}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      <span className="text-blue-400">{r.fromColumn}</span>
                      <span className="text-white/20"> → </span>
                      <span className="text-yellow-400">{r.toColumn}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Incoming FKs */}
        {incoming.length > 0 && (
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">
              Referenced by ← ({incoming.length})
            </h3>
            <div className="space-y-2">
              {incoming.map((r, i) => {
                const source = getTable(r.from);
                const labels = getRelationshipLabels(r, tables);
                return (
                  <button
                    key={i}
                    onClick={() => onSelectTable(r.from)}
                    className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{source?.icon}</span>
                        <span className="font-mono text-xs text-white/80 group-hover:text-white transition-colors">
                          {r.from}
                        </span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${relBadge[r.type]}`}>
                        {labels.from} : {labels.to}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      <span className="text-blue-400">{r.fromColumn}</span>
                      <span className="text-white/20"> → </span>
                      <span className="text-yellow-400">{r.toColumn}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {outgoing.length === 0 && incoming.length === 0 && (
          <p className="text-white/30 text-xs text-center py-4">No relationships found.</p>
        )}
      </div>
    </div>
  );
};

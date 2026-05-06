import { useState, useMemo } from "react";
import { tables, relationships, tableGroups, TableType } from "./data/schema";
import { TableCard } from "./components/TableCard";
import { RelationshipPanel } from "./components/RelationshipPanel";
import { StatsBar } from "./components/StatsBar";
import { ERDView } from "./components/ERDView";

type ViewMode = "cards" | "erd";

const groupColorBorder: Record<string, string> = {
  indigo: "border-indigo-500/40",
  blue:   "border-blue-500/40",
  amber:  "border-amber-500/40",
  rose:   "border-rose-500/40",
  teal:   "border-teal-500/40",
};
const groupColorLabel: Record<string, string> = {
  indigo: "text-indigo-300",
  blue:   "text-blue-300",
  amber:  "text-amber-300",
  rose:   "text-rose-300",
  teal:   "text-teal-300",
};
const groupColorBg: Record<string, string> = {
  indigo: "bg-indigo-500/10",
  blue:   "bg-blue-500/10",
  amber:  "bg-amber-500/10",
  rose:   "bg-rose-500/10",
  teal:   "bg-teal-500/10",
};

export default function App() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filteredTables = useMemo(() => {
    let result = tables;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.columns.some((c) => c.name.toLowerCase().includes(q))
      );
    }
    if (activeGroup) {
      const group = tableGroups.find((g) => g.label === activeGroup);
      if (group) {
        result = result.filter((t) => group.tables.includes(t.id));
      }
    }
    return result;
  }, [searchQuery, activeGroup]);

  const filteredIds = filteredTables.map((t) => t.id);

  const getRelatedTables = (id: string) =>
    relationships
      .filter((r) => r.from === id || r.to === id)
      .flatMap((r) => [r.from, r.to])
      .filter((t) => t !== id);

  const relatedTables = selectedTable ? getRelatedTables(selectedTable) : [];

  const groupedTables = tableGroups.map((g) => ({
    ...g,
    items: filteredTables.filter((t) => g.tables.includes(t.id)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* ─── Header ─── */}
      <header className="shrink-0 px-6 py-4 border-b border-white/10 bg-gray-900/80 backdrop-blur-md flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg">
            🗃️
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">Joestar Library</h1>
            <p className="text-[11px] text-white/40 leading-none mt-0.5">Database Schema Explorer</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-lg">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Search tables, columns…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-xs"
              >✕</button>
            )}
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "cards" ? "bg-blue-600 text-white shadow" : "text-white/50 hover:text-white"}`}
          >
            📋 Cards
          </button>
          <button
            onClick={() => setViewMode("erd")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "erd" ? "bg-blue-600 text-white shadow" : "text-white/50 hover:text-white"}`}
          >
            🗺 ERD
          </button>
        </div>

        {/* DB Badge */}
        <div className="hidden xl:flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-green-300 text-xs font-mono">joestar_library</span>
          <span className="text-green-500/50 text-xs">utf8mb4_unicode_ci</span>
        </div>
      </header>

      {/* ─── Stats bar ─── */}
      <StatsBar />

      {/* ─── Group filter ─── */}
      <div className="shrink-0 px-6 py-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
        <span className="text-white/30 text-xs shrink-0">Filter:</span>
        <button
          onClick={() => setActiveGroup(null)}
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
            activeGroup === null
              ? "bg-white/20 border-white/30 text-white"
              : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          All Tables
        </button>
        {tableGroups.map((g) => (
          <button
            key={g.label}
            onClick={() => setActiveGroup(activeGroup === g.label ? null : g.label)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
              activeGroup === g.label
                ? `${groupColorBg[g.color]} ${groupColorBorder[g.color]} ${groupColorLabel[g.color]}`
                : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
            }`}
          >
            {g.label}
            <span className="ml-1 opacity-60">({g.tables.length})</span>
          </button>
        ))}
        {(searchQuery || activeGroup) && (
          <span className="text-white/30 text-xs shrink-0 ml-2">
            Showing {filteredTables.length} of {tables.length} tables
          </span>
        )}
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {viewMode === "erd" ? (
          /* ─── ERD View ─── */
          <div className="flex-1 overflow-hidden">
            <ERDView
              selectedTable={selectedTable}
              onSelectTable={setSelectedTable}
              filteredTables={filteredIds}
            />
          </div>
        ) : (
          /* ─── Cards View ─── */
          <div
            className="flex-1 overflow-y-auto p-6 space-y-8"
            onClick={() => setSelectedTable(null)}
          >
            {filteredTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/30">
                <span className="text-5xl">🔍</span>
                <p className="text-lg font-medium">No tables match your search</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveGroup(null); }}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              groupedTables.map((group) => (
                <section key={group.label}>
                  <div className={`flex items-center gap-3 mb-4 pb-2 border-b ${groupColorBorder[group.color] || "border-white/10"}`}>
                    <span className={`text-xs font-bold uppercase tracking-widest ${groupColorLabel[group.color] || "text-white/50"}`}>
                      {group.label}
                    </span>
                    <span className="text-white/20 text-xs">{group.items.length} tables</span>
                    <div className="flex-1 h-px bg-white/5"></div>
                    <GroupRelSummary groupTables={group.items} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {group.items.map((table) => {
                      const isHighlighted = selectedTable === table.id;
                      const isRelated = relatedTables.includes(table.id);
                      const isDimmed = selectedTable !== null && !isHighlighted && !isRelated;
                      return (
                        <TableCard
                          key={table.id}
                          table={table}
                          isHighlighted={isHighlighted}
                          isRelated={isRelated}
                          isDimmed={isDimmed}
                          onClick={() => setSelectedTable(isHighlighted ? null : table.id)}
                          onColumnHover={() => {}}
                        />
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {/* ─── Relationship Panel ─── */}
        {selectedTable && viewMode === "cards" && (
          <RelationshipPanel
            selectedTable={selectedTable}
            tables={tables}
            relationships={relationships}
            onSelectTable={(id) => setSelectedTable(id)}
            onClose={() => setSelectedTable(null)}
          />
        )}
      </div>
    </div>
  );
}

function GroupRelSummary({ groupTables }: { groupTables: TableType[] }) {
  const ids = groupTables.map((t) => t.id);
  const internalRels = relationships.filter(
    (r) => ids.includes(r.from) && ids.includes(r.to)
  ).length;
  const externalRels = relationships.filter(
    (r) =>
      (ids.includes(r.from) && !ids.includes(r.to)) ||
      (!ids.includes(r.from) && ids.includes(r.to))
  ).length;

  return (
    <div className="flex items-center gap-2 text-[10px] text-white/30">
      {internalRels > 0 && (
        <span className="bg-white/5 px-1.5 py-0.5 rounded">{internalRels} internal</span>
      )}
      {externalRels > 0 && (
        <span className="bg-white/5 px-1.5 py-0.5 rounded">{externalRels} external refs</span>
      )}
    </div>
  );
}

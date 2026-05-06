import React, { useRef, useEffect, useState, useCallback } from "react";
import { tables, relationships, getRelationshipLabels } from "../data/schema";

// Fixed layout positions for each table (x, y in the canvas)
const TABLE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Lookup (top left)
  academic_year:     { x: 60,   y: 60 },
  speciality:        { x: 300,  y: 60 },
  settings:          { x: 540,  y: 60 },

  // Users & Auth (top center-right)
  users:             { x: 840,  y: 60 },
  invitation:        { x: 1160, y: 60 },
  remember_token:    { x: 1380, y: 60 },

  // Catalog (middle left)
  document:          { x: 60,   y: 340 },
  author:            { x: 340,  y: 520 },
  document_author:   { x: 200,  y: 680 },
  copy:              { x: 560,  y: 340 },

  // Circulation (middle right)
  reservation:       { x: 840,  y: 340 },
  loan:              { x: 1100, y: 340 },
  fine:              { x: 1380, y: 520 },

  // Engagement (bottom)
  notification:      { x: 60,   y: 860 },
  broadcast_message: { x: 360,  y: 860 },
  saved_list:        { x: 700,  y: 860 },
  review:            { x: 980,  y: 860 },
  report:            { x: 1240, y: 860 },
};

const TABLE_WIDTH = 220;
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 60;
const DESC_HEIGHT = 28;

function getTableHeight(id: string) {
  const t = tables.find((t) => t.id === id);
  if (!t) return HEADER_HEIGHT + DESC_HEIGHT;
  return HEADER_HEIGHT + DESC_HEIGHT + t.columns.length * ROW_HEIGHT + 4;
}

const COLOR_HEX: Record<string, { bg: string; header: string; border: string; pk: string; fk: string; col: string; desc: string }> = {
  indigo:  { bg: "#1e1b4b", header: "#4338ca", border: "#6366f1", pk: "#fef08a", fk: "#93c5fd", col: "#c7d2fe", desc: "#818cf8" },
  violet:  { bg: "#1e1b2e", header: "#6d28d9", border: "#7c3aed", pk: "#fef08a", fk: "#93c5fd", col: "#ddd6fe", desc: "#a78bfa" },
  blue:    { bg: "#172554", header: "#1d4ed8", border: "#3b82f6", pk: "#fef08a", fk: "#67e8f9", col: "#bfdbfe", desc: "#60a5fa" },
  cyan:    { bg: "#0c1a2e", header: "#0e7490", border: "#06b6d4", pk: "#fef08a", fk: "#93c5fd", col: "#a5f3fc", desc: "#22d3ee" },
  slate:   { bg: "#1e293b", header: "#475569", border: "#64748b", pk: "#fef08a", fk: "#93c5fd", col: "#cbd5e1", desc: "#94a3b8" },
  amber:   { bg: "#1c1005", header: "#b45309", border: "#f59e0b", pk: "#fef08a", fk: "#93c5fd", col: "#fde68a", desc: "#f59e0b" },
  orange:  { bg: "#1c0f00", header: "#c2410c", border: "#f97316", pk: "#fef08a", fk: "#93c5fd", col: "#fed7aa", desc: "#fb923c" },
  yellow:  { bg: "#1c1800", header: "#a16207", border: "#eab308", pk: "#fef08a", fk: "#93c5fd", col: "#fef08a", desc: "#eab308" },
  green:   { bg: "#052e16", header: "#15803d", border: "#22c55e", pk: "#fef08a", fk: "#93c5fd", col: "#bbf7d0", desc: "#4ade80" },
  purple:  { bg: "#1a0533", header: "#7e22ce", border: "#a855f7", pk: "#fef08a", fk: "#93c5fd", col: "#e9d5ff", desc: "#c084fc" },
  rose:    { bg: "#1a0509", header: "#be123c", border: "#f43f5e", pk: "#fef08a", fk: "#93c5fd", col: "#fecdd3", desc: "#fb7185" },
  teal:    { bg: "#021a14", header: "#0f766e", border: "#14b8a6", pk: "#fef08a", fk: "#93c5fd", col: "#99f6e4", desc: "#2dd4bf" },
  pink:    { bg: "#1a0510", header: "#be185d", border: "#ec4899", pk: "#fef08a", fk: "#93c5fd", col: "#fbcfe8", desc: "#f472b6" },
  red:     { bg: "#1a0505", header: "#b91c1c", border: "#ef4444", pk: "#fef08a", fk: "#93c5fd", col: "#fecaca", desc: "#f87171" },
  fuchsia: { bg: "#1a0520", header: "#a21caf", border: "#d946ef", pk: "#fef08a", fk: "#93c5fd", col: "#f5d0fe", desc: "#e879f9" },
  lime:    { bg: "#0a1500", header: "#4d7c0f", border: "#84cc16", pk: "#fef08a", fk: "#93c5fd", col: "#d9f99d", desc: "#a3e635" },
  sky:     { bg: "#082032", header: "#0369a1", border: "#0ea5e9", pk: "#fef08a", fk: "#93c5fd", col: "#bae6fd", desc: "#38bdf8" },
  stone:   { bg: "#1c1917", header: "#57534e", border: "#78716c", pk: "#fef08a", fk: "#93c5fd", col: "#d6d3d1", desc: "#a8a29e" },
};

function getRelColor(type: string) {
  if (type === "one-to-one") return "#4ade80";
  if (type === "many-to-many") return "#fb923c";
  return "#a78bfa";
}


// Compute edge: find shortest path between two table boxes
function getEdgePoints(
  fromId: string,
  toId: string,
  positions: Record<string, { x: number; y: number }>
): { x1: number; y1: number; x2: number; y2: number } {
  const fp = positions[fromId] || TABLE_POSITIONS[fromId] || { x: 0, y: 0 };
  const tp = positions[toId] || TABLE_POSITIONS[toId] || { x: 0, y: 0 };
  const fh = getTableHeight(fromId);
  const th = getTableHeight(toId);

  // Centers
  const fcx = fp.x + TABLE_WIDTH / 2;
  const fcy = fp.y + fh / 2;
  const tcx = tp.x + TABLE_WIDTH / 2;
  const tcy = tp.y + th / 2;

  const dx = tcx - fcx;
  const dy = tcy - fcy;

  let x1 = fcx, y1 = fcy, x2 = tcx, y2 = tcy;

  // Exit from right or left of from table
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      x1 = fp.x + TABLE_WIDTH;
      y1 = Math.min(Math.max(tcy, fp.y + 10), fp.y + fh - 10);
      x2 = tp.x;
      y2 = Math.min(Math.max(fcy, tp.y + 10), tp.y + th - 10);
    } else {
      x1 = fp.x;
      y1 = Math.min(Math.max(tcy, fp.y + 10), fp.y + fh - 10);
      x2 = tp.x + TABLE_WIDTH;
      y2 = Math.min(Math.max(fcy, tp.y + 10), tp.y + th - 10);
    }
  } else {
    // Exit from top or bottom
    if (dy > 0) {
      x1 = Math.min(Math.max(tcx, fp.x + 10), fp.x + TABLE_WIDTH - 10);
      y1 = fp.y + fh;
      x2 = Math.min(Math.max(fcx, tp.x + 10), tp.x + TABLE_WIDTH - 10);
      y2 = tp.y;
    } else {
      x1 = Math.min(Math.max(tcx, fp.x + 10), fp.x + TABLE_WIDTH - 10);
      y1 = fp.y;
      x2 = Math.min(Math.max(fcx, tp.x + 10), tp.x + TABLE_WIDTH - 10);
      y2 = tp.y + th;
    }
  }

  return { x1, y1, x2, y2 };
}

function CurvedArrow({
  x1, y1, x2, y2, color, type, fromLabel, toLabel, isHighlighted, isDimmed
}: {
  x1: number; y1: number; x2: number; y2: number;
  color: string; type: string; fromLabel: string; toLabel: string;
  isHighlighted: boolean; isDimmed: boolean;
}) {
  const cx1 = (x1 + x2) / 2;
  const cy1 = y1;
  const cx2 = (x1 + x2) / 2;
  const cy2 = y2;

  const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  const opacity = isDimmed ? 0.05 : isHighlighted ? 1 : 0.35;
  const strokeWidth = isHighlighted ? 2 : 1;

  const getLabelPos = (t: number) => {
    const omt = 1 - t;
    const bx = omt * omt * omt * x1 + 3 * omt * omt * t * cx1 + 3 * omt * t * t * cx2 + t * t * t * x2;
    const by = omt * omt * omt * y1 + 3 * omt * omt * t * cy1 + 3 * omt * t * t * cy2 + t * t * t * y2;
    const dxdt = 3 * omt * omt * (cx1 - x1) + 6 * omt * t * (cx2 - cx1) + 3 * t * t * (x2 - cx2);
    const dydt = 3 * omt * omt * (cy1 - y1) + 6 * omt * t * (cy2 - cy1) + 3 * t * t * (y2 - cy2);
    const dlen = Math.sqrt(dxdt * dxdt + dydt * dydt) || 1;
    const nx = -dydt / dlen;
    const ny = dxdt / dlen;
    return { x: bx + nx * 12, y: by + ny * 12 };
  };

  const renderLabel = (text: string, t: number) => {
    const { x, y } = getLabelPos(t);
    const labelWidth = text.length * 7 + 10;
    const labelHeight = 16;
    return (
      <g transform={`translate(${x - labelWidth / 2} ${y - labelHeight / 2})`}>
        <rect
          x={0}
          y={0}
          width={labelWidth}
          height={labelHeight}
          rx={8}
          fill="rgba(0,0,0,0.6)"
          stroke={color}
          strokeOpacity={0.5}
        />
        <text
          x={labelWidth / 2}
          y={labelHeight / 2 + 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fontFamily="monospace"
          fill="#ffffff"
        >
          {text}
        </text>
      </g>
    );
  };

  // Dash style
  const dash = type === "one-to-one" ? "4,3" : type === "many-to-many" ? "2,2" : "none";

  return (
    <g style={{ opacity }}>
      <path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth + 4}
        fill="none"
        strokeOpacity={0.05}
      />
      <path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={dash}
      />
      {renderLabel(fromLabel, 0.12)}
      {renderLabel(toLabel, 0.88)}
    </g>
  );
}

interface ERDViewProps {
  selectedTable: string | null;
  onSelectTable: (id: string | null) => void;
  filteredTables: string[];
}

export const ERDView: React.FC<ERDViewProps> = ({ selectedTable, onSelectTable, filteredTables }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(0.7);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tablePositions, setTablePositions] = useState<Record<string, { x: number; y: number }>>(
    () => ({ ...TABLE_POSITIONS })
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [tableDragOffset, setTableDragOffset] = useState({ x: 0, y: 0 });
  const [didMoveTable, setDidMoveTable] = useState(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((z) => Math.min(2, Math.max(0.3, z + delta)));
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const getWorldPoint = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  }, [pan.x, pan.y, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest("[data-table]")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingTableId) {
      const { x, y } = getWorldPoint(e);
      setTablePositions((prev) => ({
        ...prev,
        [draggingTableId]: { x: x - tableDragOffset.x, y: y - tableDragOffset.y },
      }));
      if (!didMoveTable) setDidMoveTable(true);
      return;
    }
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingTableId(null);
    setTableDragOffset({ x: 0, y: 0 });
  };

  const relatedTables = selectedTable
    ? relationships
        .filter((r) => r.from === selectedTable || r.to === selectedTable)
        .flatMap((r) => [r.from, r.to])
        .filter((t) => t !== selectedTable)
    : [];

  const isTableVisible = (id: string) =>
    filteredTables.length === 0 || filteredTables.includes(id);

  const isRelHighlighted = (r: typeof relationships[0]) =>
    selectedTable === r.from || selectedTable === r.to;

  const isRelDimmed = (r: typeof relationships[0]) =>
    selectedTable !== null && !isRelHighlighted(r);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-950 cursor-grab active:cursor-grabbing">
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % 40} ${pan.y % 40}) scale(${zoom})`}>
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}
          className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors">+</button>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
          className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors">−</button>
        <button onClick={() => { setZoom(0.7); setPan({ x: 0, y: 0 }); }}
          className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors">⌂</button>
        <div className="text-center text-white/40 text-[10px]">{Math.round(zoom * 100)}%</div>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if ((e.target as SVGElement).closest("[data-table]")) return;
          onSelectTable(null);
        }}
      >
        <defs>
          {Object.entries(COLOR_HEX).map(([color, hex]) => (
            <React.Fragment key={color}>
              <linearGradient id={`header-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={hex.header} stopOpacity="1" />
                <stop offset="100%" stopColor={hex.header} stopOpacity="0.85" />
              </linearGradient>
            </React.Fragment>
          ))}
        </defs>

        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          {/* Relationship lines */}
          {relationships
            .filter((r) => isTableVisible(r.from) && isTableVisible(r.to))
            .map((r, i) => {
              const { x1, y1, x2, y2 } = getEdgePoints(r.from, r.to, tablePositions);
              const labels = getRelationshipLabels(r);
              return (
                <CurvedArrow
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  color={getRelColor(r.type)}
                  type={r.type}
                  fromLabel={labels.from}
                  toLabel={labels.to}
                  isHighlighted={isRelHighlighted(r)}
                  isDimmed={isRelDimmed(r)}
                />
              );
            })}

          {/* Tables */}
          {tables
            .filter((t) => isTableVisible(t.id))
            .map((table) => {
              const pos = tablePositions[table.id] || TABLE_POSITIONS[table.id] || { x: 0, y: 0 };
              const h = getTableHeight(table.id);
              const c = COLOR_HEX[table.color] || COLOR_HEX.slate;
              const isSelected = selectedTable === table.id;
              const isRel = relatedTables.includes(table.id);
              const isDimmed = selectedTable !== null && !isSelected && !isRel;
              const isHovered = hoveredTable === table.id;

              return (
                <g
                  key={table.id}
                  data-table={table.id}
                  transform={`translate(${pos.x} ${pos.y})`}
                  style={{ cursor: "pointer", opacity: isDimmed ? 0.25 : 1, transition: "opacity 0.2s" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (didMoveTable) {
                      setDidMoveTable(false);
                      return;
                    }
                    onSelectTable(isSelected ? null : table.id);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (e.button !== 0) return;
                    const { x, y } = getWorldPoint(e);
                    const currentPos = tablePositions[table.id] || TABLE_POSITIONS[table.id] || { x: 0, y: 0 };
                    setDraggingTableId(table.id);
                    setTableDragOffset({ x: x - currentPos.x, y: y - currentPos.y });
                    setDidMoveTable(false);
                  }}
                  onMouseEnter={() => setHoveredTable(table.id)}
                  onMouseLeave={() => setHoveredTable(null)}
                >
                  {/* Shadow */}
                  {(isSelected || isHovered) && (
                    <rect
                      x={-3} y={-3}
                      width={TABLE_WIDTH + 6}
                      height={h + 6}
                      rx={10}
                      fill={c.border}
                      opacity={0.25}
                    />
                  )}

                  {/* Body */}
                  <rect
                    x={0} y={0}
                    width={TABLE_WIDTH}
                    height={h}
                    rx={8}
                    fill={c.bg}
                    stroke={isSelected ? c.border : isRel ? c.border : c.border}
                    strokeWidth={isSelected ? 2 : isRel ? 1.5 : 0.8}
                    strokeOpacity={isSelected ? 1 : isRel ? 0.7 : 0.4}
                  />

                  {/* Header */}
                  <rect
                    x={0} y={0}
                    width={TABLE_WIDTH}
                    height={HEADER_HEIGHT}
                    rx={8}
                    fill={`url(#header-grad-${table.color})`}
                  />
                  <rect x={0} y={HEADER_HEIGHT - 8} width={TABLE_WIDTH} height={8} fill={c.header} />

                  {/* Icon + name */}
                  <text x={12} y={28} fontSize={18} dominantBaseline="middle">{table.icon}</text>
                  <text x={38} y={24} fontSize={12} fontWeight="bold" fill="#fff" fontFamily="monospace">{table.name}</text>
                  <text x={38} y={42} fontSize={9} fill="rgba(255,255,255,0.5)" fontFamily="monospace">
                    {table.columns.length} columns
                  </text>

                  {/* Description */}
                  <rect x={0} y={HEADER_HEIGHT} width={TABLE_WIDTH} height={DESC_HEIGHT} fill="rgba(255,255,255,0.04)" />
                  <text
                    x={10}
                    y={HEADER_HEIGHT + DESC_HEIGHT / 2 + 1}
                    fontSize={8}
                    fill="rgba(255,255,255,0.4)"
                    fontFamily="sans-serif"
                    dominantBaseline="middle"
                  >
                    {table.description.length > 34 ? table.description.substring(0, 34) + "…" : table.description}
                  </text>

                  {/* Divider */}
                  <line
                    x1={0} y1={HEADER_HEIGHT + DESC_HEIGHT}
                    x2={TABLE_WIDTH} y2={HEADER_HEIGHT + DESC_HEIGHT}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                  />

                  {/* Columns */}
                  {table.columns.map((col, ci) => {
                    const rowY = HEADER_HEIGHT + DESC_HEIGHT + ci * ROW_HEIGHT;
                    const rowFill = ci % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent";

                    return (
                      <g key={col.name}>
                        <rect x={0} y={rowY} width={TABLE_WIDTH} height={ROW_HEIGHT} fill={rowFill} />
                        {/* PK/FK indicator */}
                        {col.isPK ? (
                          <text x={8} y={rowY + ROW_HEIGHT / 2} dominantBaseline="middle" fontSize={9}>🔑</text>
                        ) : col.isFK ? (
                          <text x={8} y={rowY + ROW_HEIGHT / 2} dominantBaseline="middle" fontSize={9}>🔗</text>
                        ) : (
                          <circle cx={12} cy={rowY + ROW_HEIGHT / 2} r={3} fill={c.border} opacity={0.5} />
                        )}
                        {/* Name */}
                        <text
                          x={24}
                          y={rowY + ROW_HEIGHT / 2}
                          dominantBaseline="middle"
                          fontSize={9.5}
                          fontFamily="monospace"
                          fill={col.isPK ? c.pk : col.isFK ? c.fk : c.col}
                          fontWeight={col.isPK ? "bold" : "normal"}
                        >
                          {col.name.length > 20 ? col.name.substring(0, 20) + "…" : col.name}
                        </text>
                        {/* Type */}
                        <text
                          x={TABLE_WIDTH - 6}
                          y={rowY + ROW_HEIGHT / 2}
                          dominantBaseline="middle"
                          fontSize={8}
                          fontFamily="monospace"
                          fill="rgba(255,255,255,0.25)"
                          textAnchor="end"
                        >
                          {col.type.length > 12 ? col.type.substring(0, 12) : col.type}
                        </text>
                        {/* Row separator */}
                        {ci < table.columns.length - 1 && (
                          <line
                            x1={0} y1={rowY + ROW_HEIGHT}
                            x2={TABLE_WIDTH} y2={rowY + ROW_HEIGHT}
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth={0.5}
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Bottom rounded clip */}
                  <rect
                    x={0} y={h - 8}
                    width={TABLE_WIDTH}
                    height={8}
                    rx={0}
                    fill={c.bg}
                  />
                </g>
              );
            })}
        </g>
      </svg>

      {/* Hint */}
      <div className="absolute bottom-3 left-3 text-white/25 text-[10px] pointer-events-none">
        Scroll to zoom · Drag to pan · Click table to inspect
      </div>
    </div>
  );
};

import React from "react";

export default function StatBar({ label, value, fillColor = "#9CA3AF", maxStat = 360 }) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? Math.max(0, Math.min(n, maxStat)) : 0;
  let pct = Math.round((safe / maxStat) * 100);
  if (pct > 0 && pct < 1) pct = 1;
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-28 text-right pr-2 font-medium">{label}</div>
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: fillColor }} />
      </div>
      <div className="w-12 text-center tabular-nums">{safe}</div>
    </div>
  );
}

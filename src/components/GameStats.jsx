import React, { useEffect, useState } from "react";
import StatBar from "./StatBar.jsx";

async function fetchPokeSpecies(name){
  const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("not ok");
  return await res.json();
}
function statMap(p){
  const m = {};
  (p?.stats || []).forEach(s => { m[s.stat.name] = s.base_stat; });
  return m;
}

export default function GameStats({ speciesName, color = "#6366F1" }){
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!speciesName) { setStats(null); setErr(null); return; }
    let cancelled = false;
    setLoading(true); setErr(null);
    fetchPokeSpecies(speciesName)
      .then(p => { if (!cancelled) setStats(statMap(p)); })
      .catch(() => { if (!cancelled) setErr("Game stats unavailable"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [speciesName]);

  if (!speciesName) return null;

  return (
    <div className="mt-3">
      <div className="text-sm font-semibold">Video Game Base Stats ({speciesName})</div>
      {loading && <div className="text-xs">Loading stats…</div>}
      {err && <div className="text-xs text-red-600">{err}</div>}
      {stats && (
        <div className="mt-1 space-y-1">
          <StatBar label="HP" value={stats["hp"]} fillColor={color} />
          <StatBar label="Attack" value={stats["attack"]} fillColor={color} />
          <StatBar label="Defense" value={stats["defense"]} fillColor={color} />
          <StatBar label="Sp. Atk" value={stats["special-attack"]} fillColor={color} />
          <StatBar label="Sp. Def" value={stats["special-defense"]} fillColor={color} />
          <StatBar label="Speed" value={stats["speed"]} fillColor={color} />
        </div>
      )}
    </div>
  );
}

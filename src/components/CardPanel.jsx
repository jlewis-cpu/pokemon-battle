import React, { useState } from "react";
import StatBar from "./StatBar.jsx";
import Autocomplete from "./Autocomplete.jsx";
import { getTypeColorsVG } from "../types.js";

async function fetchMon(nameOrId){
  const key = String(nameOrId || "").toLowerCase().trim();
  if (!key) throw new Error("Please enter a name");
  const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Pokémon not found");
  return await res.json();
}

export default function CardPanel({ side, selection, setSelection, data, setData, onLoaded }){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load(){
    if (!selection) return;
    setLoading(true); setError(null);
    try {
      const mon = await fetchMon(selection);
      setData(mon); onLoaded?.(mon);
    } catch(e){
      setError(e?.message || "Failed to load"); setData(null);
    } finally {
      setLoading(false);
    }
  }

  const colors = getTypeColorsVG(data?.types);
  const stats = Object.fromEntries((data?.stats||[]).map(s=>[s.stat.name, s.base_stat]));

  function onKeyDown(e){ if (e.key === "Enter") { e.preventDefault(); load(); } }

  return (
    <div className="card-frame">
      <div className="card-inner">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs uppercase tracking-wider text-gray-500">{side}</span>
          <div className="flex gap-2">
            <button onClick={load} className="px-2 py-1 rounded-lg border text-md bg-blue-600 text-yellow-300 border-blue-600 hover:bg-blue-700 hover:text-yellow-200">Search</button>
          </div>
        </div>

        <div onKeyDown={onKeyDown}>
          <Autocomplete value={selection} onChange={setSelection} onSelect={(v)=>{ setSelection(v); }} placeholder="Start typing a Pokémon (e.g., pikachu), then press Search/Enter" />
        </div>

        <div className="mt-3" />

        {loading && <div className="text-sm">Loading…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {data && (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4">
              <img src={data?.sprites?.other?.['official-artwork']?.front_default || data?.sprites?.front_default} alt={data?.name} className="w-44 object-contain drop-shadow-card bg-white rounded-xl" />
              <div className="flex-1">
                <div className="text-xl font-bold capitalize">{data?.name}</div>
                <div className="mt-1 text-xs text-gray-600 capitalize">{data?.types?.map(t=>t.type.name).join(', ')}</div>
              </div>
            </div>

            <div className="space-y-1">
              <StatBar label="HP" value={stats["hp"]} fillColor={colors.bar} maxStat={255} />
              <StatBar label="Attack" value={stats["attack"]} fillColor={colors.bar} />
              <StatBar label="Defense" value={stats["defense"]} fillColor={colors.bar} />
              <StatBar label="Sp. Atk" value={stats["special-attack"]} fillColor={colors.bar} />
              <StatBar label="Sp. Def" value={stats["special-defense"]} fillColor={colors.bar} />
              <StatBar label="Speed" value={stats["speed"]} fillColor={colors.bar} />
            </div>
          </div>
        )}

        {!data && (
          <div className="text-sm text-gray-600">Type a name and press <b>Search</b> (or Enter). The list loads once and then is instant.</div>
        )}
      </div>
    </div>
  )
}

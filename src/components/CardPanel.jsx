import React, { useState } from "react";
import StatBar from "./StatBar.jsx";
import Autocomplete from "./Autocomplete.jsx";
import GameStats from "./GameStats.jsx";
import PokemonPicker from "./PokemonPicker.jsx";
import { getTypeColorsTCG, baseSpeciesFromCardName } from "../types";
import { loadCardFromCache, saveCardToCache } from "../cache";
import { addToCollection } from "../collection";
import { tcgFetch, TCG_KEY } from "../tcgFetch";

const CARD_CACHE = new Map();

async function fetchCardByName(name){
  
  const base = "https://api.pokemontcg.io/v2/cards";
  const n = String(name || "").trim();
  if (!n) throw new Error("Please enter a name");

  const makeUrl = (q, size = 48) =>
    `${base}?pageSize=${size}&q=${encodeURIComponent(`(supertype:"Pokémon") AND (${q})`)}&select=name,types,subtypes,hp,attacks,images`;

  const queries = [
    `name:"${n}"`,
    `name:${n}`,
    `name:${n}*`,
    `name:*${n}*`,
    `(name:*${n}*) AND (hp:>0)`,
  ];

  for (const q of queries) {
    const url = makeUrl(q, 96);
    if (CARD_CACHE.has(url)) return CARD_CACHE.get(url);
    const res = await tcgFetch(url);
    if (!res.ok) continue;
    const data = await res.json();
    const cards = data?.data || [];
    if (cards.length) {
      cards.sort((a, b) => (b?.images?.large ? 1 : 0) - (a?.images?.large ? 1 : 0));
      const card = cards[0];
      CARD_CACHE.set(url, card);
      return card;
    }
  }

  const basey = n.toLowerCase()
    .replace(/\b(vmax|vstar|v-union|ex|gx|break|prime|lv\.x|star|δ|mega)\b/g, "")
    .replace(/\bv\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (basey && basey !== n.toLowerCase()) {
    const url = makeUrl(`name:*${basey}*`, 96);
    const res = await tcgFetch(url);
    if (res.ok) {
      const data = await res.json();
      const cards = data?.data || [];
      if (cards.length) {
        cards.sort((a, b) => (b?.images?.large ? 1 : 0) - (a?.images?.large ? 1 : 0));
        return cards[0];
      }
    }
  }
  throw new Error("No card found for that name");
}

function parseAttackDamage(attacks){
  if (!Array.isArray(attacks)) return 0;
  const vals = attacks.map(a => {
    const s = (a?.damage || "").toString();
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  });
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
}

export default function CardPanel({ side, selection, setSelection, data, setData, onLoaded, offline }){
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savedTick, setSavedTick] = useState(false);

  function addAndSave() {
    if (!selection) return;
    addToCollection(selection);   // always add name
    if (data) saveCardToCache(selection, data);  // save full card if loaded
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1200);
  }

  async function load(){
    if (!selection) return;
    setLoading(true); setError(null);

    const cached = loadCardFromCache(selection);
    if (cached) { setData(cached); onLoaded?.(cached); setLoading(false); return; }
    if (offline) { setError('Not in local catalog'); setData(null); setLoading(false); return; }

    try {
      const card = await fetchCardByName(selection);
      saveCardToCache(selection, card);
      setData(card); onLoaded?.(card);
    } catch(e){
      setError(e?.message || 'Failed to load card'); setData(null);
    } finally {
      setLoading(false);
    }
  }

  const colors = getTypeColorsTCG(data?.types);
  const hp = data?.hp ? parseInt(data.hp, 10) : 0;
  const avgDmg = parseAttackDamage(data?.attacks);

  function onKeyDown(e){
    if (e.key === "Enter") { e.preventDefault(); load(); }
  }

  return (
    <div className="card-frame">
      <div className="card-inner">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs uppercase tracking-wider text-gray-500">{side}</span>
          <div className="flex gap-2">
            <button onClick={() => setPickerOpen(true)} className="px-2 py-1 rounded-lg border text-sm">Load Pokémon</button>
            <button
                id="searchBtnLeft"
                onClick={load}
                className="px-2 py-1 rounded-lg border text-base"
              >
                Search
              </button>
            <button
              onClick={addAndSave}
              className="px-2 py-1 rounded-lg border text-sm"
              title="Add name to Collection; if loaded, also save card offline"
            >
              {savedTick ? "✅ Added & Saved" : "Add & Save"}
            </button>
          </div>
        </div>

        <div onKeyDown={onKeyDown}>
          <Autocomplete
            value={selection}
            onChange={setSelection}
            onSelect={(v)=>{ setSelection(v); }}
            placeholder="Type full card name (e.g., Pikachu V) then press Search or Enter"
          />
        </div>

        <div className="mt-3" />

        {loading && <div className="text-sm">Loading…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!TCG_KEY && <div className="text-xs text-orange-600">No API key detected. Add VITE_TCG_KEY in .env</div>}

        {data && (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4">
              <img src={data?.images?.large || data?.images?.small} alt={data?.name} className="w-44 object-contain drop-shadow-card bg-white rounded-xl" />
              <div className="flex-1">
                <div className="text-xl font-bold">{data?.name}</div>
                <div className="mt-1 text-xs text-gray-600">{data?.supertype} {data?.subtypes?.join(', ') || ''}</div>
                <div className="mt-2 text-sm">Type: {data?.types?.join(', ') || 'Colorless'}</div>
              </div>
            </div>

            <div className="space-y-1">
              <StatBar label="HP" value={hp} fillColor={colors.bar} />
              <StatBar label="Avg Attack" value={avgDmg} fillColor={colors.bar} maxStat={300} />
            </div>

            <GameStats speciesName={baseSpeciesFromCardName(data?.name)} color={colors.bar} />
          </div>
        )}

        {!data && (
          <div className="text-sm text-gray-600">Pick from <b>Load Pokémon</b> (local list) or type a name and press <b>Search</b>/<b>Enter</b>.</div>
        )}
      </div>

      <PokemonPicker open={pickerOpen} onClose={()=>setPickerOpen(false)} onChoose={(n)=>{ setSelection(n); setPickerOpen(false); }} />
    </div>
  )
}

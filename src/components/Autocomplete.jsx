import React, { useEffect, useRef, useState } from "react";

const LS_LIST = 'poke_names_v1';

async function fetchSpeciesList() {
  const url = 'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0';
  const res = await fetch(url);
  if (!res.ok) throw new Error('list not ok');
  const data = await res.json();
  return data.results.map(r => r.name);
}

export default function Autocomplete({ value, onChange, onSelect, placeholder="Start typing a Pokémon…" }){
  const [q, setQ] = useState(value || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  useEffect(() => setQ(value || ""), [value]);

  // Load list once
  useEffect(() => {
    let mounted = true;
    const cached = JSON.parse(localStorage.getItem(LS_LIST) || "[]");
    if (cached.length) setItems(cached.slice(0, 20));
    (async () => {
      try {
        const names = await fetchSpeciesList();
        if (!mounted) return;
        localStorage.setItem(LS_LIST, JSON.stringify(names));
        updateList(q, names);
      } catch {}
    })();
    return () => { mounted = false; }
  }, []);

  function updateList(query, baseList=null){
    const names = baseList || JSON.parse(localStorage.getItem(LS_LIST) || "[]");
    if (!query || !query.trim()) {
      setItems(names.slice(0, 20)); setOpen(names.length>0); return;
    }
    const p = query.toLowerCase();
    const filtered = names.filter(n => n.includes(p)).slice(0, 20);
    setItems(filtered); setOpen(filtered.length>0);
  }

  useEffect(() => { updateList(q); }, [q]);

  useEffect(() => {
    function onDocClick(e){ if (!ref.current) return; if (!ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function choose(str){ onSelect?.(str); onChange?.(str); setQ(str); setOpen(false); }
  function onKey(e){
    if (e.key === "Enter") { e.preventDefault(); choose(q); return; }
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(items.length - 1, h + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(0, h - 1)); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div className="relative" ref={ref}>
      <input className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2"
        placeholder={placeholder} value={q}
        onChange={(e)=>{ setQ(e.target.value); onChange?.(e.target.value); }}
        onFocus={()=>{ if(items.length) setOpen(true); }} onKeyDown={onKey} />
      {open && items.length > 0 && (
        <ul className="absolute z-40 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
          {items.map((name, i) => (
            <li key={name + i} className={"px-3 py-2 text-sm cursor-pointer capitalize " + (i === highlight ? "bg-indigo-50" : "")}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(name)} onMouseEnter={() => setHighlight(i)}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

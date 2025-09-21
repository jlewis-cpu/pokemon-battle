import React, { useEffect, useRef, useState } from "react";
import { getCachedNames } from "../cache";
import { getCollectionNames } from "../collection";

export default function Autocomplete({ value, onChange, onSelect, placeholder = "Type full card name…" }) {
  const [q, setQ] = useState(value || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  useEffect(() => setQ(value || ""), [value]);

  useEffect(() => {
    if (!q || q.trim().length < 1) {
      const fromCollection = getCollectionNames('');
      const local = getCachedNames('');
      const merged = Array.from(new Set([...fromCollection, ...local])).slice(0, 20);
      setItems(merged); setOpen(merged.length > 0); return;
    }
    const fromCollection = getCollectionNames(q.trim());
    const local = getCachedNames(q.trim());
    const merged = Array.from(new Set([...fromCollection, ...local])).slice(0, 20);
    setItems(merged); setOpen(merged.length > 0);
  }, [q]);

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
            <li key={name + i} className={"px-3 py-2 text-sm cursor-pointer " + (i === highlight ? "bg-indigo-50" : "")}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(name)} onMouseEnter={() => setHighlight(i)}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

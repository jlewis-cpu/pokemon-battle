import React, { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { getCollectionNames } from "../collection";
import { getCachedNames } from "../cache";

export default function PokemonPicker({ open, onClose, onChoose }){
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [letter, setLetter] = useState("A");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    const col = getCollectionNames('');
    const cache = getCachedNames('');
    const all = Array.from(new Set([...col, ...cache]));
    const merged = all.filter(n => n.toUpperCase().startsWith(letter));
    setItems(merged);
  }, [letter, open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold">Pick a Pokémon by first letter</div>
        <div className="flex flex-wrap gap-1">
          {alphabet.map(ch => (
            <button key={ch} onClick={() => setLetter(ch)} className={"w-8 h-8 rounded border text-sm " + (letter===ch ? "bg-black text-white" : "")}>
              {ch}
            </button>
          ))}
        </div>
        <div className="h-64 overflow-auto border rounded-lg p-2 bg-white">
          {items.length === 0 && <div className="text-sm text-gray-600">Add names to your Collection to see them here.</div>}
          <ul className="space-y-1">
            {items.map((n, i) => (
              <li key={n + i}>
                <button className="w-full text-left px-2 py-1 rounded hover:bg-indigo-50" onClick={() => { onChoose?.(n); onClose?.(); }}>
                  {n}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

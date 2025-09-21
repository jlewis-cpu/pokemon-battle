import React, { useEffect, useState } from 'react';
import CardPanel from './components/CardPanel.jsx';
import WinnerModal from './components/WinnerModal.jsx';
import './index.css';
import { getCollection, setCollection } from './collection';

function scoreCard(attacker, defender) {
  const hp = attacker?.hp ? parseInt(attacker.hp, 10) : 0;
  const atkVals = (attacker?.attacks || []).map(a => {
    const m = String(a?.damage || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  });
  const avgAtk = atkVals.length ? atkVals.reduce((a, b) => a + b, 0) / atkVals.length : 0;

  const stage = attacker?.subtypes?.join(' ') || '';
  const speed = stage.toLowerCase().includes('basic')
    ? 1.05
    : stage.toLowerCase().includes('stage 2')
    ? 0.95
    : 1.0;

  const atkType = (attacker?.types && attacker.types[0])?.toLowerCase() || 'colorless';
  const defType = (defender?.types && defender.types[0])?.toLowerCase() || 'colorless';

  const TYPE_CHART = {
    lightning: { water: 2 },
    water: { fire: 2 },
    fire: { grass: 2 },
    grass: { water: 2 },
    fighting: { darkness: 2, metal: 2, colorless: 2 },
    psychic: { fighting: 2 },
    darkness: { psychic: 2 },
    metal: { fairy: 2 },
    dragon: { dragon: 2 },
  };

  const eff = (TYPE_CHART[atkType] && TYPE_CHART[atkType][defType]) || 1;
  const core = hp * 0.3 + avgAtk * 1.0;
  return core * speed * eff;
}

export default function App(){
  const [leftSel, setLeftSel] = useState('');
  const [rightSel, setRightSel] = useState('');
  const [leftCard, setLeftCard] = useState(null);
  const [rightCard, setRightCard] = useState(null);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [winnerCard, setWinnerCard] = useState(null);
  const [battleId, setBattleId] = useState(0);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  useEffect(() => {
    if (!collectionOpen) return;
    setTimeout(() => {
      const ta = document.getElementById('collTA');
      if (!ta) return;
      const list = getCollection();
      ta.value = (list || []).join('\n');
    }, 0);
  }, [collectionOpen]);

  function canBattle(){ return !!(leftCard && rightCard) }
  function doBattle(){
    if (!canBattle()) return;

    const l = scoreCard(leftCard, rightCard);
    const r = scoreCard(rightCard, leftCard);

    let verdict = '';
    const diff = Math.abs(l - r);
    const edge = diff < 10 ? 'It could go either way!' : diff < 30 ? 'Close fight!' : 'Clear edge.';

    if (l > r) { verdict = `${leftCard.name} wins. ${edge}`; setWinnerCard(leftCard); }
    else if (r > l) { verdict = `${rightCard.name} wins. ${edge}`; setWinnerCard(rightCard); }
    else { verdict = 'Perfect tie!'; setWinnerCard(leftCard); }

    setResult(`${verdict}\n(Left ${l.toFixed(1)} vs Right ${r.toFixed(1)})`);
    setBattleId(id=>id+1);
    setModalOpen(true);
  }
  function swap(){
    const ls = leftSel, rs = rightSel, lc = leftCard, rc = rightCard;
    setLeftSel(rs); setRightSel(ls); setLeftCard(rc); setRightCard(lc); setResult(null); setWinnerCard(null); setBattleId(id=>id+1);
  }
  function randomBoth(){
    const picks = ['Pikachu V', 'Charizard ex', 'Greninja V', 'Gardevoir ex', 'Mew VMAX', 'Arceus VSTAR'];
    const pick = () => picks[Math.floor(Math.random()*picks.length)];
    setLeftSel(pick()); setRightSel(pick());
    setLeftCard(null); setRightCard(null); setResult(null); setWinnerCard(null); setBattleId(id=>id+1);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 to-indigo-100 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Pokémon Battle Guessr — TCG</h1>
            <p className="text-sm text-gray-600">Manual search (no background API calls). Collection + offline cache.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={swap} className="px-3 py-2 rounded-lg border">Swap Sides</button>
            <button onClick={randomBoth} className="px-3 py-2 rounded-lg border">Randomize Both</button>
            <button onClick={()=>setBulkOpen(true)} className="px-3 py-2 rounded-lg border">Bulk Import</button>
            <button onClick={()=>setCollectionOpen(true)} className="px-3 py-2 rounded-lg border">Collection</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardPanel side="left" selection={leftSel} setSelection={setLeftSel} data={leftCard} setData={setLeftCard} onLoaded={() => { setWinnerCard(null); setResult(null); }} />
          <CardPanel side="right" selection={rightSel} setSelection={setRightSel} data={rightCard} setData={setRightCard} onLoaded={() => { setWinnerCard(null); setResult(null); }} />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-6">
          <button disabled={!canBattle()} onClick={doBattle} className="px-5 py-3 rounded-xl text-white disabled:opacity-50" style={{ background: canBattle() ? '#215732' : '#9CA3AF' }}>
            Battle!
          </button>
          <div className="text-sm text-gray-600">Type card names and press <b>Search</b> (no background requests). Check console for header logs.</div>
        </div>

        <footer className="mt-10 text-xs text-gray-500">
          Card data & images via Pokémon TCG API. Not affiliated with Nintendo/The Pokémon Company. For fun only.
        </footer>
      </div>

      <WinnerModal key={battleId} open={modalOpen} onClose={() => setModalOpen(false)} winnerCard={winnerCard} verdictText={result || 'No result yet.'} />

      {/* Bulk Import Modal */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setBulkOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-[92%] p-6">
            <div className="text-lg font-semibold mb-2">Bulk Import Cards</div>
            <p className="text-sm text-gray-600 mb-3">Paste card names (one per line). We will fetch and cache each.</p>
            <textarea id="bulkTA" className="w-full h-40 border rounded-lg p-2" placeholder={'Pikachu V\nCharizard ex\nMew VMAX'}></textarea>
            <div className="mt-3 flex gap-2 justify-end">
              <button className="px-3 py-2 rounded-lg border" onClick={()=>setBulkOpen(false)}>Close</button>
              <button className="px-3 py-2 rounded-lg bg-black text-white" onClick={async ()=>{
                const ta = document.getElementById('bulkTA'); if (!ta) return;
                const names = ta.value.split('\n').map(s=>s.trim()).filter(Boolean);
                const { saveCardToCache } = await import('./cache');
                const base = "https://api.pokemontcg.io/v2/cards";
                const { tcgFetch } = await import('./tcgFetch');
                const makeUrl = (q) => `${base}?pageSize=1&q=${encodeURIComponent(`(supertype:"Pokémon") AND (${q})`)}&select=name,types,subtypes,hp,attacks,images`;
                for (const name of names){
                  const attempts = [`name:"${name}"`, `name:${name}`, `name:${name}*`, `name:*${name}*`];
                  let found = null;
                  for (const q of attempts){
                    const res = await tcgFetch(makeUrl(q));
                    if (!res.ok) continue;
                    const data = await res.json();
                    const cards = data?.data || [];
                    if (cards.length){
                      cards.sort((a,b)=>(b?.images?.large?1:0)-(a?.images?.large?1:0));
                      found = cards[0]; break;
                    }
                  }
                  if (found) saveCardToCache(name, found);
                }
                alert('Import complete. These are now available offline.');
                setBulkOpen(false);
              }}>Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Modal */}
      {collectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setCollectionOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-[92%] p-6">
            <div className="text-lg font-semibold mb-2">Your Collection</div>
            <p className="text-sm text-gray-600 mb-3">Add or edit your card names (one per line). These show in suggestions instantly and work offline.</p>
            <textarea id="collTA" className="w-full h-56 border rounded-lg p-2" placeholder={'Pikachu V\nCharizard ex\nMew VMAX'}></textarea>
            <div className="mt-3 flex gap-2 justify-end">
              <button className="px-3 py-2 rounded-lg border" onClick={()=>setCollectionOpen(false)}>Close</button>
              <button className="px-3 py-2 rounded-lg bg-black text-white" onClick={()=>{
                const ta = document.getElementById('collTA'); if (!ta) return;
                const names = ta.value.split('\n').map(s=>s.trim()).filter(Boolean);
                setCollection(names);
                alert('Saved! Autocomplete & picker will use your list.');
                setCollectionOpen(false);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

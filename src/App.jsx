import React, { useState } from 'react';
import CardPanel from './components/CardPanel.jsx';
import Countdown from './components/Countdown.jsx';
import WinnerModal from './components/WinnerModal.jsx';
import './index.css';

function scoreBase(mon){
  const stats = Object.fromEntries((mon.stats||[]).map(s=>[s.stat.name, s.base_stat]));
  const hp = stats["hp"] || 0;
  const atk = stats["attack"] || 0;
  const spa = stats["special-attack"] || 0;
  return hp*0.3 + (atk+spa)/2;
}
function typeEdge(attacker, defender){
  const a = attacker?.types?.[0]?.type?.name || 'normal';
  const d = defender?.types?.[0]?.type?.name || 'normal';
  const chart = { electric:{water:2}, water:{fire:2}, fire:{grass:2}, grass:{water:2} };
  return (chart[a] && chart[a][d]) || 1;
}

// Wildcards: chaos events for fun
function applyWildcards(score, mon, opp, mode){
  if (mode === 'off') return { score, notes: [] };
  // Mild vs Wacky magnitude
  const mag = mode === 'wacky' ? 0.25 : 0.12; // up to +/-25% or 12%
  const notes = [];
  let s = score;

  // 1) Critical hit chance
  if (Math.random() < (mode === 'wacky' ? 0.25 : 0.15)) {
    s *= 1.5; notes.push('Critical hit! ×1.5');
  }
  // 2) Stumble (bad luck)
  if (Math.random() < (mode === 'wacky' ? 0.2 : 0.1)) {
    s *= 0.85; notes.push('Oops! Stumbled. ×0.85');
  }
  // 3) Weather boost (random weather favors a type)
  const weather = Math.random();
  if (weather < 0.2) {
    // Rain boosts water
    if ((mon?.types||[]).some(t => t.type.name === 'water')) { s *= 1 + mag; notes.push('Rain! Water boosted'); }
  } else if (weather < 0.4) {
    // Sun boosts fire
    if ((mon?.types||[]).some(t => t.type.name === 'fire')) { s *= 1 + mag; notes.push('Harsh sunlight! Fire boosted'); }
  } else if (weather < 0.6) {
    // Electric terrain
    if ((mon?.types||[]).some(t => t.type.name === 'electric')) { s *= 1 + mag; notes.push('Electric terrain! Electric boosted'); }
  } else if (weather < 0.8) {
    // Grassy terrain
    if ((mon?.types||[]).some(t => t.type.name === 'grass')) { s *= 1 + mag; notes.push('Grassy terrain! Grass boosted'); }
  }
  // 4) Small random variance to keep things spicy
  const delta = (Math.random()*2 - 1) * mag; // -mag..+mag
  s *= (1 + delta);
  if (Math.abs(delta) > mag*0.66) notes.push(delta > 0 ? 'Lucky break!' : 'Bad luck…');

  return { score: s, notes };
}

export default function App(){
  const [leftSel, setLeftSel] = useState('');
  const [rightSel, setRightSel] = useState('');
  const [countdownOpen, setCountdownOpen] = useState(false);
  const [leftMon, setLeftMon] = useState(null);
  const [rightMon, setRightMon] = useState(null);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [winnerMon, setWinnerMon] = useState(null);
  const [battleId, setBattleId] = useState(0);
  const [wildMode, setWildMode] = useState('mild'); // 'off' | 'mild' | 'wacky'

  function canBattle(){ return !!(leftMon && rightMon); }
  function doBattle(){
    if (!canBattle()) return;
    setCountdownOpen(true);
  }
  function computeAndShowWinner(){
  // --- BEGIN: this is what you used to do inside doBattle()
  const scoreBase = (mon) => {
    const stats = Object.fromEntries((mon.stats||[]).map(s=>[s.stat.name, s.base_stat]));
    const hp = stats["hp"] || 0;
    const atk = stats["attack"] || 0;
    const spa = stats["special-attack"] || 0;
    return hp*0.3 + (atk+spa)/2;
  };
  const typeEdge = (attacker, defender) => {
    const a = attacker?.types?.[0]?.type?.name || 'normal';
    const d = defender?.types?.[0]?.type?.name || 'normal';
    const chart = { electric:{water:2}, water:{fire:2}, fire:{grass:2}, grass:{water:2} };
    return (chart[a] && chart[a][d]) || 1;
  };

  let l = scoreBase(leftMon) * typeEdge(leftMon, rightMon);
  let r = scoreBase(rightMon) * typeEdge(rightMon, leftMon);

  // If you have Wildcard Mode in your App, keep your applyWildcards() calls here:
  // const lw = applyWildcards(l, leftMon, rightMon, wildMode);
  // const rw = applyWildcards(r, rightMon, leftMon, wildMode);
  // l = lw.score; r = rw.score;

  let verdict = '';
  const diff = Math.abs(l-r);
  const edge = diff < 10 ? 'It could go either way!' : diff < 30 ? 'Close fight!' : 'Clear edge.';
  if (l > r) { verdict = `${capitalize(leftMon.name)} wins. ${edge}`; setWinnerMon(leftMon); }
  else if (r > l) { verdict = `${capitalize(rightMon.name)} wins. ${edge}`; setWinnerMon(rightMon); }
  else { verdict = 'Perfect tie!'; setWinnerMon(leftMon); }

  const line2 = `(Left ${l.toFixed(1)} vs Right ${r.toFixed(1)})`;
  setResult([verdict, line2].join('\\n'));
  setModalOpen(true);
  // --- END
}

  
  function swap(){ const ls=leftSel, rs=rightSel, l=leftMon, r=rightMon;
    setLeftSel(rs); setRightSel(ls); setLeftMon(r); setRightMon(l); setResult(null); setWinnerMon(null); setBattleId(id=>id+1); }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 to-indigo-100 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Pokémon Battle Guessr!</h1>
            <p className="text-sm text-gray-600">Decide the ultimate Pokémon showdowns</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-sm flex items-center gap-2 bg-white/70 px-2 py-1 rounded-lg border">
              Wildcards:
              <select value={wildMode} onChange={(e)=>setWildMode(e.target.value)} className="border rounded px-2 py-1 text-sm bg-white">
                <option value="off">Off</option>
                <option value="mild">Mild</option>
                <option value="wacky">Wacky</option>
              </select>
            </label>
            <button onClick={swap} className="px-3 py-2 rounded-lg border">Swap Sides</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><CardPanel side="left" selection={leftSel} setSelection={setLeftSel} data={leftMon} setData={setLeftMon} onLoaded={()=>{ setWinnerMon(null); setResult(null); }} /></div>
          <div><CardPanel side="right" selection={rightSel} setSelection={setRightSel} data={rightMon} setData={setRightMon} onLoaded={()=>{ setWinnerMon(null); setResult(null); }} /></div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-6">
          <button disabled={!canBattle()} onClick={doBattle} className="px-5 py-3 rounded-xl text-white disabled:opacity-50" style={{ background: canBattle() ? '#215732' : '#9CA3AF' }}>Battle!</button>
          <div className="text-sm text-gray-600">Choose Mild or Wacky for dramatic twists (crits, weather boosts, lucky breaks).</div>
        </div>

        <footer className="mt-10 text-xs text-gray-500">
          Data & images via PokeAPI sprites/official artwork. Not affiliated with Nintendo/The Pokémon Company. For fun only.
        </footer>
      </div>

      <Countdown
        open={countdownOpen}
        onDone={() => {
          setCountdownOpen(false);
          computeAndShowWinner();
        }}
        images={["/countdown/3.png", "/countdown/2.png", "/countdown/1.png"]}
        stepMs={650}
      />



      <WinnerModal key={battleId} open={modalOpen} onClose={() => setModalOpen(false)} winnerMon={winnerMon} verdictText={result || 'No result yet.'} />
    </div>
  );
}

function capitalize(s){ return (s||'').slice(0,1).toUpperCase() + (s||'').slice(1); }

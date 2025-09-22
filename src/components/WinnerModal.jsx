import React, { useEffect, useRef } from "react";
import Modal from "./Modal.jsx";

function drawFX(ctx,W,H,t,type){
  const k = String(type||"normal").toLowerCase();
  if (k==="electric"){ ctx.strokeStyle="rgba(255,241,118,0.9)"; ctx.lineWidth=2;
    for(let i=0;i<4;i++){ let x=Math.random()*W,y=0; ctx.beginPath(); ctx.moveTo(x,y);
      for(let s=0;s<6;s++){ x+=-40+Math.random()*80; y+=H/6; ctx.lineTo(Math.max(0,Math.min(W,x)),y);} ctx.stroke();
    } return;
  }
  if (k==="fire"){ for(let i=0;i<50;i++){ const x=Math.random()*W,y=H-Math.random()*80,r=1+Math.random()*3;
    ctx.fillStyle=`rgba(${240+Math.random()*15},${90+Math.random()*80},0,${0.3+Math.random()*0.5})`;
    ctx.beginPath(); ctx.arc(x,y-(t%1000)/20,r,0,Math.PI*2); ctx.fill(); } return; }
  if (k==="water"){ ctx.strokeStyle="rgba(56,189,248,0.5)";
    for(let i=0;i<40;i++){ const x=Math.random()*W,y=Math.random()*H,r=1+Math.random()*2.5;
      ctx.beginPath(); ctx.arc(x,y+(t%1000)/30,r,0,Math.PI*2); ctx.stroke(); } return; }
  if (k==="grass"){ ctx.strokeStyle="rgba(34,197,94,0.6)";
    for(let i=0;i<50;i++){ const x=Math.random()*W,y=H-Math.random()*60;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-4,y-8-(t%1000)/50); ctx.stroke(); } return; }
  ctx.fillStyle="rgba(255,255,255,0.08)"; for(let i=0;i<8;i++){ const r=40+Math.random()*80,x=W/2+Math.cos(i)*r,y=H/2+Math.sin(i)*r; ctx.beginPath(); ctx.arc(x,y,r/2,0,Math.PI*2); ctx.fill(); }
}

export default function WinnerModal({ open, onClose, winnerMon, verdictText }){
  const canvasRef = useRef(null);
  useEffect(()=>{
    if(!open) return;
    const c=canvasRef.current; if(!c) return; const ctx=c.getContext("2d");
    const resize=()=>{ c.width=c.offsetWidth; c.height=c.offsetHeight; };
    resize(); let raf;
    const loop=(t)=>{ const W=c.width,H=c.height; ctx.clearRect(0,0,W,H);
      drawFX(ctx,W,H,t,(winnerMon?.types?.[0]?.type?.name)||"normal"); raf=requestAnimationFrame(loop); };
    raf=requestAnimationFrame(loop); window.addEventListener("resize",resize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); }
  },[open,winnerMon]);

  if (!open || !winnerMon) return null;
  const img = winnerMon?.sprites?.other?.['official-artwork']?.front_default || winnerMon?.sprites?.front_default || "";

// 🔧 Normalize verdictText so "\n" (literal) becomes real newlines
const normalized = String(verdictText || "").replace(/\\n/g, "\n");

// Now split into parts
const lines = normalized.split("\n");
const headline = (lines[0] || "").trim();
const scoreLine = (lines[1] || "").trim();
const notes = lines.slice(2).join("\n"); // remaining lines (may be empty)

return (
  <Modal open={open} onClose={onClose}>
    <div className="relative shake">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
      />
      <div className="relative flex flex-col items-center gap-3">
        <div
          className="px-4 py-1 rounded-full text-white text-xs font-bold tracking-wide"
          style={{ background: "linear-gradient(90deg,#2563eb,#1d4ed8)" }}
        >
          Winner!
        </div>

        {/* Headline */}
        <div className="pokemon-text text-3xl md:text-4xl font-extrabold text-center select-none">
          {headline}
        </div>

        {/* Score line in smaller gray */}
        {scoreLine && (
          <div className="text-sm text-gray-500 text-center">{scoreLine}</div>
        )}

        {/* Notes with preserved line breaks */}
        {notes && (
          <div className="mt-1 text-sm text-gray-600 text-center whitespace-pre-wrap">
            {notes}
          </div>
        )}

        <div className="mt-2 rounded-2xl border bg-gradient-to-br from-yellow-50 to-amber-100 p-3">
          <img
            src={
              winnerMon?.sprites?.other?.["official-artwork"]?.front_default ||
              winnerMon?.sprites?.front_default ||
              ""
            }
            alt={winnerMon?.name}
            className="w-64 object-contain drop-shadow-card bg-white rounded-xl"
          />
          <div className="mt-2 text-center font-semibold capitalize">
            {winnerMon?.name}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            className="px-4 py-2 rounded-lg border"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Modal>
);


}

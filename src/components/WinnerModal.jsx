import React, { useEffect, useRef } from "react";
import Modal from "./Modal.jsx";

function drawElectric(ctx, W, H) {
  ctx.strokeStyle = "rgba(255,241,118,0.9)"; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    let x = Math.random() * W; let y = 0; ctx.beginPath(); ctx.moveTo(x, y);
    const segments = 6; for (let s = 0; s < segments; s++) {
      x += -40 + Math.random() * 80; y += H / segments;
      ctx.lineTo(Math.max(0, Math.min(W, x)), y);
    }
    ctx.stroke();
  }
}
function drawFire(ctx, W, H, t) {
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * W, y = H - Math.random() * 80, r = 1 + Math.random() * 3;
    ctx.fillStyle = `rgba(${240 + Math.random() * 15}, ${90 + Math.random() * 80}, 0, ${0.3 + Math.random() * 0.5})`;
    ctx.beginPath(); ctx.arc(x, y - (t % 1000) / 20, r, 0, Math.PI * 2); ctx.fill();
  }
}
function drawWater(ctx, W, H, t) {
  ctx.strokeStyle = "rgba(56,189,248,0.5)";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 1 + Math.random() * 2.5;
    ctx.beginPath(); ctx.arc(x, y + (t % 1000) / 30, r, 0, Math.PI * 2); ctx.stroke();
  }
}
function drawGrass(ctx, W, H, t) {
  ctx.strokeStyle = "rgba(34,197,94,0.6)";
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * W, y = H - Math.random() * 60;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y - 8 - (t % 1000) / 50); ctx.stroke();
  }
}
function typeFX(ctx, W, H, t, type) {
  const k = String(type || "colorless").toLowerCase();
  if (k === "electric" || k === "lightning") return drawElectric(ctx, W, H, t);
  if (k === "fire") return drawFire(ctx, W, H, t);
  if (k === "water") return drawWater(ctx, W, H, t);
  if (k === "grass") return drawGrass(ctx, W, H, t);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 8; i++) {
    const r = 40 + Math.random() * 80, x = W/2 + Math.cos(i)*r, y = H/2 + Math.sin(i)*r;
    ctx.beginPath(); ctx.arc(x, y, r/2, 0, Math.PI * 2); ctx.fill();
  }
}

export default function WinnerModal({ open, onClose, winnerCard, verdictText }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); let raf;
    const loop = (t) => {
      const W = canvas.width, H = canvas.height; ctx.clearRect(0,0,W,H);
      const type = (winnerCard?.types && winnerCard.types[0]) || "colorless"; typeFX(ctx, W, H, t || 0, type);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [open, winnerCard]);

  if (!open || !winnerCard) return null;
  const img = winnerCard?.images?.large || winnerCard?.images?.small || "";
  const headline = (verdictText || "").split("\n")[0];
  const subtext = (verdictText || "").split("\n").slice(1).join("\n");

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative shake">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="px-4 py-1 rounded-full text-white text-xs font-bold tracking-wide" style={{ background: "linear-gradient(90deg, #2563eb, #1d4ed8)" }}>Winner!</div>
          <div className="pokemon-text text-3xl md:text-4xl font-extrabold text-center select-none">{headline}</div>
          <div className="mt-1 text-sm text-gray-600 text-center whitespace-pre-wrap">{subtext}</div>
          <div className="mt-2 rounded-2xl border bg-gradient-to-br from-yellow-50 to-amber-100 p-3">
            <img src={img} alt={winnerCard?.name} className="w-64 object-contain drop-shadow-card bg-white rounded-xl" />
            <div className="mt-2 text-center font-semibold">{winnerCard?.name}</div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

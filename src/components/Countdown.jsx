import React, { useEffect, useMemo, useState } from "react";

export default function Countdown({ open, onDone, images = ["/countdown/3.png", "/countdown/2.png", "/countdown/1.png"], stepMs = 700 }) {
  const [idx, setIdx] = useState(0);

  // Preload images to avoid flicker
  useEffect(() => {
    images.forEach(src => { const i = new Image(); i.src = src; });
  }, [images]);

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    let i = 0;
    const tick = () => {
      if (i >= images.length) { onDone?.(); return; }
      setIdx(i++);
      t = setTimeout(tick, stepMs);
    };
    let t = setTimeout(tick, 0);
    return () => clearTimeout(t);
  }, [open, images, stepMs, onDone]);

  if (!open) return null;

  const src = images[Math.min(idx, images.length - 1)];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative select-none">
        <img
          key={idx}                               // ✅ remount each step so animation restarts
          src={src}
          alt="countdown"
          className="w-48 h-48 object-contain drop-shadow-2xl
                    animate-[countpulse_700ms_ease-in-out]"
          style={{ willChange: 'transform,opacity' }}
        />
      </div>

      <style>{`
        @keyframes countpulse {
          0%   { transform: scale(1);   opacity: 1; }
          40%  { transform: scale(1.4); opacity: 1; }   /* big */
          80%  { transform: scale(1);   opacity: 1; }   /* back to normal */
          100% { transform: scale(1);   opacity: 0; }   /* fade out before switch */
        }
      `}</style>
    </div>
  );
}

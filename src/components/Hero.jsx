import { useEffect, useRef } from 'react';

// Anillo de ondas que respira, como el boceto: curvas cerradas con ruido senoidal.
const CURVES = [
  { k: [7, 11], s: [0.6, 0.4], amp: 0.07, color: '255,255,255,.95' },
  { k: [9, 13], s: [-0.5, 0.7], amp: 0.06, color: '255,255,255,.6' },
  { k: [5, 8], s: [0.35, -0.55], amp: 0.08, color: '14,21,94,.35' },
  { k: [11, 6], s: [-0.7, 0.3], amp: 0.05, color: '255,255,255,.8' },
];

function RingWave() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, size = 0;
    const resize = () => {
      const d = window.devicePixelRatio || 1;
      size = cv.clientWidth; cv.width = cv.height = size * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const draw = (ms) => {
      const t = ms / 1000; ctx.clearRect(0, 0, size, size);
      CURVES.forEach((c, n) => {
        ctx.beginPath();
        for (let i = 0; i <= 240; i++) {
          const a = (i / 240) * Math.PI * 2;
          const r = size * (0.32 + c.amp * (0.6 * Math.sin(c.k[0] * a + t * c.s[0] * 2 + n) + 0.4 * Math.sin(c.k[1] * a + t * c.s[1] * 2)));
          const x = size / 2 + Math.cos(a) * r, y = size / 2 + Math.sin(a) * r;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath(); ctx.strokeStyle = `rgba(${c.color})`; ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(255,255,255,.8)'; ctx.shadowBlur = 12; ctx.stroke();
      });
      if (!still) raf = requestAnimationFrame(draw);
    };
    resize(); draw(0);
    if (!still) raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} role="img" aria-label="Ondas de audio formando un anillo" />;
}

export default function Hero({ onStart }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>Detección de audios deepfake</h1>
        <p>Sube un audio y dos redes neuronales, una CNN y una LSTM, te dicen si la voz es real o sintética.</p>
        <button className="btn btn--primary" onClick={onStart}>Comenzar</button>
      </div>
      <div className="hero-ring"><RingWave /></div>
    </section>
  );
}

import { useEffect, useRef } from 'react';

// Dona peluda: miles de "pelos" sobre un toroide. Su largo ondula como una onda de audio.
const N = 3600;
const TONES = ['202,169,243', '179,122,212', '121,151,230', '32,106,188', '14,21,94']; // paleta
const R = 0.29, r = 0.15, TAU = Math.PI * 2;

function FuzzyTorus() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hairs = Array.from({ length: N }, () => {
      const u = Math.random() * TAU, v = Math.random() * TAU;
      const tone = 0.5 + 0.5 * Math.sin(u + Math.random() * 2.4);
      return { u, cu: Math.cos(u), su: Math.sin(u), cv: Math.cos(v), sv: Math.sin(v), len: 0.35 + Math.random() * 0.65,
        jx: (Math.random() - 0.5) * 0.02, jy: (Math.random() - 0.5) * 0.02, jz: (Math.random() - 0.5) * 0.02,
        b: Math.min(4, Math.floor(tone * 5)) };
    });
    const segs = Array.from({ length: 10 }, () => []);
    const a = [0, 0, 0], b2 = [0, 0, 0];
    let raf, size = 0;
    const resize = () => {
      const d = window.devicePixelRatio || 1;
      size = cv.clientWidth; cv.width = cv.height = size * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const draw = (ms) => {
      const t = ms / 1000, c = size / 2;
      ctx.clearRect(0, 0, size, size);
      const ax = 0.55 + 0.12 * Math.sin(t * 0.25), ay = 0.5 * Math.sin(t * 0.18), az = t * 0.08;
      const cax = Math.cos(ax), sax = Math.sin(ax), cay = Math.cos(ay), say = Math.sin(ay), caz = Math.cos(az), saz = Math.sin(az);
      const P = (x, y, z, o) => {
        const y1 = y * cax - z * sax, z1 = y * sax + z * cax;
        const x2 = x * cay + z1 * say; o[2] = -x * say + z1 * cay;
        o[0] = x2 * caz - y1 * saz; o[1] = x2 * saz + y1 * caz;
      };
      segs.forEach((s) => (s.length = 0));
      for (const h of hairs) {
        const rr = R + r * h.cv, bx = rr * h.cu, by = rr * h.su, bz = r * h.sv;
        const w = 0.5 + 0.5 * (0.6 * Math.sin(4 * h.u - t * 1.5) + 0.4 * Math.sin(9 * h.u + t * 1.1));
        const L = (0.02 + 0.085 * w) * h.len;
        P(bx, by, bz, a);
        P(bx + h.cv * h.cu * L + h.jx, by + h.cv * h.su * L + h.jy, bz + h.sv * L + h.jz, b2);
        segs[h.b * 2 + (a[2] > 0 ? 1 : 0)].push(c + a[0] * size, c + a[1] * size, c + b2[0] * size, c + b2[1] * size);
      }
      ctx.lineWidth = 1.1; ctx.lineCap = 'round';
      for (const front of [0, 1]) for (let k = 0; k < 5; k++) {
        const s = segs[k * 2 + front]; if (!s.length) continue;
        ctx.beginPath();
        for (let i = 0; i < s.length; i += 4) { ctx.moveTo(s[i], s[i + 1]); ctx.lineTo(s[i + 2], s[i + 3]); }
        ctx.strokeStyle = `rgba(${TONES[k]},${front ? 0.8 : 0.35})`; ctx.stroke();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    resize(); draw(0);
    if (!still) raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} role="img" aria-label="Dona de ondas de audio con textura peluda" />;
}

export default function Hero({ onStart }) {
  return (
    <section className="split">
      <div className="pane pane--color hero-copy">
        <p className="slogan">Que ninguna voz te engañe.</p>
        <h1 className="display">Detección de audios deepfake</h1>
        <p className="lead">Hoy es posible imitar una voz con inteligencia artificial, y suena cada vez más real. Sube una grabación y analizaremos si la voz es de una persona o la creó una computadora.</p>
        <button className="btn" onClick={onStart}>Comenzar</button>
      </div>
      <div className="pane pane--light torus"><FuzzyTorus /></div>
    </section>
  );
}

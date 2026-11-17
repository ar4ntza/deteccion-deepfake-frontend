import { useEffect, useRef, useState } from 'react';
import { analyzeAudio } from '../api';

const MAX_MB = 25;
const N = 72;

const PASOS = [
  { t: 'Carga tu archivo de audio.', d: `Selecciona una grabación de voz desde tu equipo o arrástrala al área indicada. El sistema admite archivos en formato WAV, MP3, FLAC y OGG, con un tamaño máximo de ${MAX_MB} MB.` },
  { t: 'Dos programas lo escuchan.', d: 'El sistema transforma el audio en una representación visual que permite observar cómo varía su frecuencia a lo largo del tiempo. Dos modelos de inteligencia artificial analizan esta representación con enfoques complementarios: uno identifica patrones visuales, como texturas y características espaciales; mientras que el otro analiza las variaciones temporales y las relaciones entre los sonidos.' },
  { t: 'Recibes un porcentaje.', d: 'Cada modelo proporciona un porcentaje de confianza que indica qué tan probable considera que la voz sea auténtica o generada artificialmente. Los resultados pueden diferir entre ambos modelos, ya que cada uno evalúa características distintas de la representación del audio.' },
];

// Mensajes de la pantalla de carga. Avanzan por tiempo (el servidor no informa su progreso real).
const ETAPAS = [
  'Procesando tu audio…',
  'Generando el espectrograma…',
  'Dos inteligencias artificiales lo están escuchando…',
  'Calculando los porcentajes…',
];

// Condiciones adicionales de "Ver otras condiciones" (la B es el resultado principal).
const CONDICIONES = [
  { id: 'A', titulo: 'Modelo base', texto: 'Aprendió con voces de varios idiomas y nunca escuchó español. Es la menos confiable: detecta pocas voces falsas en español.' },
  { id: 'C', titulo: 'Solo español', texto: 'Aprendió únicamente con voces en español, sin el entrenamiento previo.' },
];

const veredicto = (fakePct) => {
  const fake = fakePct >= 50;
  return { fake, pct: Math.round(fake ? fakePct : 100 - fakePct) };
};

const Blur = () => (
  <div className="blur" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /></div>
);

function Gauge({ pct, fake }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setOn(true)); return () => cancelAnimationFrame(id); }, []);
  const lit = pct == null ? 0 : Math.round((N * pct) / 100);
  return (
    <svg viewBox="0 0 200 200" className="gauge" aria-hidden="true">
      <circle cx="100" cy="100" r="46" className="gauge-ring" />
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r1 = 54, r2 = r1 + 6 + 28 * Math.abs(Math.sin(i * 1.9) * Math.cos(i * 0.55));
        return <line key={i} x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1}
          x2={100 + Math.cos(a) * r2} y2={100 + Math.sin(a) * r2}
          className={`bar ${i < lit && on ? 'on' : ''} ${fake ? 'fake' : 'real'}`}
          style={{ transitionDelay: `${i * 14}ms` }} />;
      })}
    </svg>
  );
}

function LoadingWaves({ count = 40 }) {
  return (
    <div className="waves waves--xl" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => <i key={i} style={{ '--i': i }} />)}
    </div>
  );
}

function ResultCard({ name, sub, tone, data }) {
  const v = data ? veredicto(data.prob_fake * 100) : null;
  return (
    <section className={`tile tile--${tone}`}>
      <h3>Modelo {name}</h3>
      <p className="tile-sub">{sub}</p>
      <Gauge key={data?.prob_fake} pct={v?.pct} fake={v?.fake} />
      <p className="verdict">{!v ? 'Sin resultado' : <><strong>{v.pct}%</strong>{v.fake ? 'voz falsa' : 'voz real'}</>}</p>
    </section>
  );
}

function OtherConditions({ todos }) {
  const [open, setOpen] = useState(false);
  const filas = CONDICIONES.map((c) => ({
    ...c, items: ['cnn', 'lstm'].map((a) => todos.find((r) => r.arquitectura === a && r.condicion === c.id)).filter(Boolean),
  })).filter((c) => c.items.length);
  if (!filas.length) return null;
  return (
    <>
      <button className="btn btn--dark" aria-expanded={open} aria-controls="otras-condiciones" onClick={() => setOpen(!open)}>
        {open ? 'Ocultar otras condiciones' : 'Ver otras condiciones'}
      </button>
      <div id="otras-condiciones" className={`more ${open ? 'is-open' : ''}`}>
        <div className="more-inner">
          {filas.map((c) => (
            <section key={c.id} className="cond">
              <h4>{c.titulo}</h4>
              <p>{c.texto}</p>
              {c.items.map((r) => {
                const v = veredicto(r.fake);
                return (
                  <div className="mini" key={r.arquitectura}>
                    <span className="mini-name">{r.arquitectura.toUpperCase()}</span>
                    <span className="mini-bar" aria-hidden="true"><i className={v.fake ? 'fake' : 'real'} style={{ width: `${v.pct}%` }} /></span>
                    <span className="mini-val">{v.pct} % {v.fake ? 'voz falsa' : 'voz real'}</span>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

// Reproductor del audio que envió la persona
function AudioPlayer({ src, nombre }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [fallo, setFallo] = useState(false);
  const fmt = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
  const toggle = () => { const a = ref.current; if (a.paused) a.play().catch(() => setFallo(true)); else a.pause(); };
  return (
    <div>
      <p className="filename">{nombre}</p>
      <div className="player">
        <audio ref={ref} src={src} preload="metadata" onError={() => setFallo(true)}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setT(0); }}
          onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} />
        <button className="player-btn" onClick={toggle} aria-label={playing ? 'Pausar audio' : 'Escuchar tu audio'}>
          {playing
            ? <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>}
        </button>
        <input type="range" min="0" max={Number.isFinite(dur) ? dur : 0} step="0.01" value={t} aria-label="Posición del audio"
          onChange={(e) => { ref.current.currentTime = +e.target.value; setT(+e.target.value); }} />
        <span className="player-time">{fmt(t)} / {fmt(dur)}</span>
      </div>
      {fallo && <p className="error">Tu navegador no puede reproducir este formato de audio.</p>}
    </div>
  );
}

export default function Analyzer() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const input = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  useEffect(() => {
    if (status !== 'loading') return;
    setEtapa(0);
    const id = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 2200);
    return () => clearInterval(id);
  }, [status]);

  const soltar = () => { if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; } setUrl(null); };
  const reiniciar = (msg = '') => { soltar(); setFile(null); setResult(null); setError(msg); setStatus('idle'); };

  async function handle(f) {
    if (!f || status === 'loading') return;
    if (!f.type.startsWith('audio/') && !/\.(wav|mp3|flac|ogg|m4a|aac)$/i.test(f.name))
      return setError('El archivo debe ser de audio (WAV, MP3, FLAC, OGG o M4A).');
    if (f.size > MAX_MB * 1024 * 1024)
      return setError(`El audio pesa más de ${MAX_MB} MB. Prueba con uno más corto.`);
    soltar(); urlRef.current = URL.createObjectURL(f); setUrl(urlRef.current);
    setFile(f); setError(''); setResult(null); setStatus('loading');
    try { setResult(await analyzeAudio(f)); setStatus('done'); }
    catch (e) {
      reiniciar(e.status >= 400 && e.status < 500 ? e.message : 'No pudimos analizar el audio. Revisa que el servidor esté activo e inténtalo de nuevo.');
    }
  }

  // ---- Pantalla 2: procesando ----
  if (status === 'loading') {
    return (
      <section className="screen screen--light">
        <Blur />
        <div className="proc">
          <LoadingWaves />
          <div role="status" aria-live="polite"><p className="proc-msg" key={etapa}>{ETAPAS[etapa]}</p></div>
          <div className="proc-steps" aria-hidden="true">{ETAPAS.map((_, i) => <i key={i} className={i <= etapa ? 'on' : ''} />)}</div>
          <p className="proc-file">{file?.name}</p>
        </div>
      </section>
    );
  }

  // ---- Pantalla 3: resultados ----
  if (status === 'done') {
    return (
      <section className="split">
        <div className="pane pane--color panel">
          <h2>Resultados</h2>
          <span className="rule" />
          <p className="lead">Esto fue lo que escucharon los modelos en tu audio. Puedes volver a oírlo aquí.</p>
          <AudioPlayer src={url} nombre={file?.name} />
          <p className="note">Los porcentajes indican la confianza de cada modelo, no una certeza: ningún resultado es definitivo.</p>
          <button className="btn" onClick={() => reiniciar()}>Analizar otro audio</button>
        </div>
        <div className="pane pane--light results">
          <div className="tiles">
            <ResultCard name="CNN" sub="Mira el audio como una imagen" tone="a" data={result?.cnn} />
            <ResultCard name="LSTM" sub="Sigue el audio como una secuencia" tone="b" data={result?.lstm} />
          </div>
          <p className="caption">Resultado principal: modelos que partieron del modelo base y se ajustaron con voces en español. En nuestras pruebas, el modelo CNN resultó más confiable que el LSTM.</p>
          {result?.todos && <OtherConditions todos={result.todos} />}
        </div>
      </section>
    );
  }

  // ---- Pantalla 1: cómo funciona + carga del audio ----
  const open = () => input.current.click();
  return (
    <section className="screen screen--light">
      <Blur />
      <span className="side-label" aria-hidden="true">Detección de audio</span>
      <div className="howto-inner">
        <h1 className="howto-title">¿Cómo funciona?</h1>
        <ol className="howto-steps">
          {PASOS.map((p) => <li key={p.t}><strong>{p.t}</strong><span>{p.d}</span></li>)}
        </ol>
        <div className={`drop ${over ? 'is-over' : ''}`} role="button" tabIndex={0}
          onClick={open} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}>
          <strong>Sube o arrastra tu audio</strong>
          <span>WAV, MP3, FLAC u OGG · hasta {MAX_MB} MB</span>
          <input ref={input} type="file" accept="audio/*" className="sr" tabIndex={-1}
            onChange={(e) => { handle(e.target.files[0]); e.target.value = ''; }} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </section>
  );
}
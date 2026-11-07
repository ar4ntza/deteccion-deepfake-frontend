import { useEffect, useRef, useState } from 'react';
import { analyzeAudio } from '../api';

const MAX_MB = 25;
const N = 72;

// Condiciones adicionales que se muestran en "Ver otras condiciones" (la B es el resultado principal).
const CONDICIONES = [
  { id: 'A', titulo: 'Modelo base', texto: 'Aprendió con voces de varios idiomas y nunca escuchó español.' },
  { id: 'C', titulo: 'Solo español', texto: 'Aprendió únicamente con voces en español, sin el entrenamiento previo.' },
];

const veredicto = (fakePct) => {
  const fake = fakePct >= 50;
  return { fake, pct: Math.round(fake ? fakePct : 100 - fakePct) };
};

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

function LoadingWaves() {
  return (
    <div className="waves" role="status" aria-label="Analizando audio">
      {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
    </div>
  );
}

function ResultCard({ name, sub, tone, status, data }) {
  const v = data ? veredicto(data.prob_fake * 100) : null;
  return (
    <section className={`tile tile--${tone}`} aria-live="polite">
      <h3>Modelo {name}</h3>
      <p className="tile-sub">{sub}</p>
      {status === 'loading' ? <LoadingWaves /> : <Gauge key={data?.prob_fake} pct={v?.pct} fake={v?.fake} />}
      <p className="verdict">
        {status === 'loading' ? 'Analizando…' : !v ? 'Sin resultado' : <><strong>{v.pct}%</strong>{v.fake ? 'voz falsa' : 'voz real'}</>}
      </p>
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

export default function Analyzer() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const input = useRef(null);
  const busy = status === 'loading';

  async function handle(f) {
    if (!f || busy) return;
    if (!f.type.startsWith('audio/') && !/\.(wav|mp3|flac|ogg|m4a|aac)$/i.test(f.name))
      return setError('El archivo debe ser de audio (WAV, MP3, FLAC, OGG o M4A).');
    if (f.size > MAX_MB * 1024 * 1024)
      return setError(`El audio pesa más de ${MAX_MB} MB. Prueba con uno más corto.`);
    setFile(f); setError(''); setResult(null); setStatus('loading');
    try { setResult(await analyzeAudio(f)); setStatus('done'); }
    catch (e) {
      setStatus('error');
      setError(e.status >= 400 && e.status < 500 ? e.message : 'No pudimos analizar el audio. Revisa que el servidor esté activo e inténtalo de nuevo.');
    }
  }

  const open = () => !busy && input.current.click();
  return (
    <section className="split">
      <div className="pane pane--color panel">
        <h2>Detección de audio</h2>
        <span className="rule" />
        <h3>¿Cómo funciona?</h3>
        <ol className="steps">
          <li><strong>Sube tu audio.</strong><span>Elige una grabación de voz desde tu equipo o arrástrala aquí. Aceptamos WAV, MP3, FLAC y OGG de hasta {MAX_MB} MB.</span></li>
          <li><strong>Dos programas lo escuchan.</strong><span>Convertimos el sonido en una imagen que muestra cómo cambia su tono con el tiempo. Dos inteligencias artificiales la revisan, cada una a su manera: una la mira como una fotografía, buscando texturas; la otra la sigue como una melodía, atenta al ritmo y a cómo se enlazan los sonidos.</span></li>
          <li><strong>Recibes un porcentaje.</strong><span>Cada una indica qué tan segura está de que la voz sea real o falsa. Es normal que no siempre coincidan: miran el audio de formas distintas.</span></li>
        </ol>
        <div className={`drop ${over ? 'is-over' : ''}`} role="button" tabIndex={0} aria-disabled={busy}
          onClick={open} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}>
          <strong>{busy ? 'Procesando…' : 'Sube o arrastra tu audio'}</strong>
          <span>{file ? file.name : `WAV, MP3, FLAC u OGG · hasta ${MAX_MB} MB`}</span>
          <input ref={input} type="file" accept="audio/*" className="sr" tabIndex={-1}
            onChange={(e) => { handle(e.target.files[0]); e.target.value = ''; }} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <p className="note">Los porcentajes indican la confianza de cada modelo, no una certeza: ningún resultado es definitivo.</p>
      </div>
      <div className="pane pane--light results">
        <div className="tiles">
          <ResultCard name="CNN" sub="Mira el audio como una imagen" tone="a" status={status} data={result?.cnn} />
          <ResultCard name="LSTM" sub="Sigue el audio como una secuencia" tone="b" status={status} data={result?.lstm} />
        </div>
        <p className="caption">
          {status === 'done'
            ? 'Resultado principal: modelos que partieron del modelo base y se ajustaron con voces en español.'
            : 'Aquí aparecerá el resultado de cada modelo.'}
        </p>
        {status === 'done' && result?.todos && <OtherConditions todos={result.todos} />}
      </div>
    </section>
  );
}

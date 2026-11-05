import { useEffect, useRef, useState } from 'react';
import { analyzeAudio } from '../api';

const MAX_MB = 25;
const N = 72;

function Gauge({ pct, fake, ms }) {
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
      {ms != null && <text x="100" y="104" className="gauge-ms">{ms} ms</text>}
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

function ResultCard({ name, status, data }) {
  const fake = data ? data.prob_fake >= 0.5 : false;
  const pct = data ? Math.round((fake ? data.prob_fake : 1 - data.prob_fake) * 100) : null;
  return (
    <section className={`tile tile--${name === 'CNN' ? 'a' : 'b'}`} aria-live="polite">
      <h3>Modelo {name}</h3>
      {status === 'loading' ? <LoadingWaves /> : <Gauge key={data?.prob_fake} pct={pct} fake={fake} ms={data?.ms} />}
      <p className="verdict">
        {status === 'loading' ? 'Analizando…' : pct == null ? 'Sin resultado' : <><strong>{pct}%</strong>{fake ? 'fake' : 'real'}</>}
      </p>
    </section>
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
    catch { setStatus('error'); setError('No pudimos analizar el audio. Revisa que el servidor esté activo e inténtalo de nuevo.'); }
  }

  const open = () => !busy && input.current.click();
  return (
    <section className="split">
      <div className="pane pane--color panel">
        <h2>Detección de audio</h2>
        <span className="rule" />
        <h3>¿Cómo funciona?</h3>
        <ol className="steps">
          <li>Carga tu audio</li><li>Los modelos lo procesan</li><li>Te entregamos los resultados</li>
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
        <p className="note">Los porcentajes muestran la confianza de cada modelo, no una probabilidad calibrada.</p>
      </div>
      <div className="pane pane--light results">
        <ResultCard name="CNN" status={status} data={result?.cnn} />
        <ResultCard name="LSTM" status={status} data={result?.lstm} />
      </div>
    </section>
  );
}

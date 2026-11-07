// Contrato del backend:
//   POST {VITE_API_URL}/predict   (multipart/form-data, campo "audio")
//   -> { resultados: [{ modelo, arquitectura: 'cnn'|'lstm', condicion: 'A'|'B'|'C', fake, real }, ...], ms_total }
// Si VITE_API_URL no está definida, se usan resultados simulados para diseñar la interfaz.
const API_URL = import.meta.env.VITE_API_URL;

export async function analyzeAudio(file) {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 3000));
    const todos = [];
    for (const arq of ['cnn', 'lstm'])
      for (const cond of ['A', 'B', 'C']) {
        const p = cond === 'A' ? 0.3 + Math.random() * 0.4 : arq === 'cnn' ? Math.random() * 0.15 : 0.15 + Math.random() * 0.6;
        todos.push({ modelo: `${arq.toUpperCase()} · ${cond}`, arquitectura: arq, condicion: cond,
          fake: Math.round(p * 1000) / 10, real: Math.round((1 - p) * 1000) / 10 });
      }
    return pick(todos);
  }
  const body = new FormData();
  body.append('audio', file);
  const res = await fetch(`${API_URL}/predict`, { method: 'POST', body });
  if (!res.ok) {
    let detalle = '';
    try { detalle = (await res.json()).detail; } catch { /* sin cuerpo JSON */ }
    const err = new Error(detalle || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const { resultados, ms_total } = await res.json();
  return { ...pick(resultados), ms_total };
}

// tarjetas principales: condición B (preentrenado + afinado). `todos` alimenta "Ver otras condiciones".
function pick(todos) {
  const get = (arq) => {
    const r = todos.find((x) => x.arquitectura === arq && x.condicion === 'B');
    return r && { prob_fake: r.fake / 100 };
  };
  return { cnn: get('cnn'), lstm: get('lstm'), todos };
}
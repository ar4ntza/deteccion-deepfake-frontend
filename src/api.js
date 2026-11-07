// Contrato del backend:
//   POST {VITE_API_URL}/predict   (multipart/form-data, campo "audio")
//   -> { resultados: [{ modelo, arquitectura: 'cnn'|'lstm', condicion: 'A'|'B'|'C', fake, real }, ...], ms_total }
// Si VITE_API_URL no está definida, se usan resultados simulados para diseñar la interfaz.
const API_URL = import.meta.env.VITE_API_URL;

export async function analyzeAudio(file) {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 3000));
    const rnd = () => Math.random();
    return {
      cnn: { prob_fake: rnd() * 0.15, ms: Math.round(30 + rnd() * 30) },
      lstm: { prob_fake: 0.15 + rnd() * 0.6, ms: Math.round(50 + rnd() * 40) },
    };
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
  // Por ahora la interfaz muestra la condición B (preentrenado + afinado); `todos` queda listo para las demás.
  const pick = (arq, cond = 'B') => {
    const r = resultados.find((x) => x.arquitectura === arq && x.condicion === cond);
    return r && { prob_fake: r.fake / 100 };
  };
  return { cnn: pick('cnn'), lstm: pick('lstm'), todos: resultados, ms_total };
}
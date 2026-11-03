// contrato esperado del backend:
//   POST {VITE_API_URL}/predict   (multipart/form-data, campo "file")
//   -> { cnn: { prob_fake: 0.04, ms: 38 }, lstm: { prob_fake: 0.22, ms: 61 } }
// VITE_API_URL no está definida TODAVIA TENGANME PACIENCIA -> resultados simulados para diseñar la interfaz.
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
  body.append('file', file);
  const res = await fetch(`${API_URL}/predict`, { method: 'POST', body });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

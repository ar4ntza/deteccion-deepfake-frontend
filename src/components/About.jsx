import { useState } from 'react';

const ITEMS = [
  {
    t: '¿De qué trata el proyecto?',
    d: 'Un sistema que decide si una voz es real o fue sintetizada con IA.',
    body: (
      <>
        <p>Este proyecto es una herramienta para detectar audios deepfake: grabaciones en las que una voz fue generada o manipulada con inteligencia artificial. Dado un audio, el sistema lo clasifica como <strong>real</strong> (voz humana) o <strong>fake</strong> (voz sintetizada).</p>
        <p>Para lograrlo, el audio se convierte en un espectrograma, una imagen que muestra cómo cambian sus frecuencias en el tiempo. Dos redes neuronales con enfoques distintos lo analizan y sus resultados se comparan entre sí.</p>
      </>
    ),
  },
  {
    t: '¿Cómo se entrenaron los modelos?',
    d: 'Dos redes neuronales, una CNN y una LSTM, entrenadas en dos etapas.',
    body: (
      <>
        <p>El entrenamiento usa transferencia de aprendizaje. En la primera etapa, cada red aprende desde cero con unos 16 mil audios multilingües (9,069 reales y 7,184 fake) qué distingue una voz humana de una sintética, sin depender de un idioma. En la segunda, se reemplaza la última capa y se ajusta la red con unos mil audios en español (≈502 reales y ≈501 fake): primero solo la capa de decisión y después toda la red con pasos más pequeños.</p>
        <p>Ambos modelos reciben los mismos datos, particiones y procedimiento, y se evalúan con el mismo conjunto de prueba en español (≈151 audios), que nunca se usó para entrenar ni para tomar decisiones. Así, si su desempeño difiere, se debe a la arquitectura.</p>
        <dl className="facts">
          <div><dt>CNN · ≈404,900 parámetros</dt><dd>Trata el espectrograma como una imagen. Sus filtros detectan texturas y patrones locales, de los más simples a los más complejos.</dd></div>
          <div><dt>LSTM · ≈692,700 parámetros</dt><dd>Lee el espectrograma como una secuencia de instantes, hacia adelante y hacia atrás. Captura ritmo, entonación y la forma en que se enlazan los sonidos, donde los sintetizadores suelen fallar.</dd></div>
        </dl>
      </>
    ),
  },
  {
    t: '¿Cómo interpretar los resultados?',
    d: 'Qué significa cada porcentaje y por qué no es una certeza.',
    body: (
      <>
        <p>Cada modelo muestra la clase que considera más probable y su porcentaje. Por ejemplo, «78 % fake» significa que el modelo asigna 78 % a fake y 22 % a real. Un audio se marca como fake cuando su probabilidad de fake es de al menos 50 %.</p>
        <p>Es normal que la CNN y la LSTM no siempre coincidan: analizan el audio de formas distintas, y por eso se comparan. El tiempo en milisegundos indica cuánto tardó cada modelo en procesarlo.</p>
        <p>El porcentaje es la confianza del modelo, no una probabilidad calibrada: las redes tienden a dar valores extremos (por ejemplo, 98 %) que no equivalen a certeza real. Además, se analiza un fragmento de aproximadamente 4 segundos del inicio del audio.</p>
      </>
    ),
  },
  {
    t: '¿Qué limitaciones tiene?',
    d: 'Lo que conviene tener presente antes de confiar en un resultado.',
    body: (
      <dl className="facts">
        <div><dt>Tamaño de la prueba</dt><dd>Con ≈151 audios, una exactitud de 0.90 tiene un margen de ±4.8 puntos (95 % de confianza). Diferencias de pocos puntos entre CNN y LSTM pueden no ser significativas.</dd></div>
        <div><dt>Posible fuga por hablante</dt><dd>Las particiones son aleatorias por audio. Si una misma persona aparece en entrenamiento y en prueba, los resultados pueden ser optimistas.</dd></div>
        <div><dt>Tipos de síntesis</dt><dd>Los modelos solo conocen los métodos de generación presentes en sus datos. Con técnicas nuevas, el desempeño puede caer.</dd></div>
        <div><dt>Probabilidades sobreconfiadas</dt><dd>Los porcentajes indican la confianza del modelo, no la certeza de que el audio sea real o fake.</dd></div>
      </dl>
    ),
  },
  {
    t: 'Equipo y contacto',
    d: 'Quiénes lo desarrollaron y cómo contactarlos.',
    body: (
      <dl className="facts">
        <div><dt>Equipo</dt><dd>
          <span className="person">Arantza García Vázquez · <a href="mailto:198447@iberopuebla.mx">198447@iberopuebla.mx</a></span>
          <span className="person">Edna Samantha Cortés Carrisoza · <a href="mailto:198343@iberopuebla.mx">198343@iberopuebla.mx</a></span>
        </dd></div>
        <div><dt>Asesor</dt><dd>Mtro. Rafael Pérez Aguirre</dd></div>
        <div><dt>Institución</dt><dd>Universidad Iberoamericana Puebla</dd></div>
        <div><dt>Materia</dt><dd>Área de Síntesis y Evaluación: desarrollo de proyectos</dd></div>
      </dl>
    ),
  },
];

export default function About() {
  const [open, setOpen] = useState(0);
  return (
    <div className="about-layout">
      <aside className="rail" aria-hidden="true"><span>Acerca del proyecto</span></aside>
      <section className="acc" aria-label="Acerca del proyecto">
        {ITEMS.map((it, i) => {
          const isOpen = open === i, id = `acc-${i}`;
          return (
            <article key={id} className={`acc-item ${isOpen ? 'is-open' : ''}`}>
              <h2>
                <button className="acc-head" aria-expanded={isOpen} aria-controls={`${id}-p`}
                  aria-labelledby={`${id}-t`} aria-describedby={`${id}-d`} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span className="acc-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="acc-title" id={`${id}-t`}>{it.t}</span>
                  <span className="acc-desc" id={`${id}-d`}>{it.d}</span>
                  <span className="acc-plus" aria-hidden="true" />
                </button>
              </h2>
              <div className="acc-panel" id={`${id}-p`} role="region" aria-labelledby={`${id}-t`}>
                <div className="acc-inner answer">{it.body}</div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

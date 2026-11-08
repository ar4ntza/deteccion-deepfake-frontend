import { useState } from 'react';

const ITEMS = [
  {
    t: '¿De qué trata el proyecto?',
    d: 'Un sistema que decide si una voz es real o fue sintetizada con IA.',
    body: (
      <>
        <p>Este proyecto es una herramienta para detectar audios deepfake: grabaciones en las que una voz fue generada o manipulada con inteligencia artificial. Dado un audio, el sistema indica si la voz parece <strong>real</strong> (humana) o <strong>falsa</strong> (sintetizada).</p>
        <p>Para lograrlo, el audio se convierte en un espectrograma, una imagen que muestra cómo cambian sus frecuencias en el tiempo. Dos redes neuronales con enfoques distintos lo analizan y sus resultados se comparan entre sí.</p>
      </>
    ),
  },
  {
    t: '¿Cómo se entrenaron los modelos?',
    d: 'Dos redes neuronales entrenadas en dos etapas y evaluadas por persona.',
    body: (
      <>
        <p>El entrenamiento usa transferencia de aprendizaje. En la primera etapa, cada red aprende desde cero con unos 16,500 audios multilingües (9,569 reales y 6,977 falsos) qué distingue una voz humana de una sintética, sin depender de un idioma. En la segunda, se reemplaza la última capa y se ajusta la red con audios en español de varias fuentes (HISPASpoof, CIEMPIESS, conferencias y grabaciones de otras personas): primero solo la capa de decisión y después toda la red con pasos más pequeños. Durante el entrenamiento se simulan distintas condiciones de grabación, como el ruido de fondo o el micrófono, para que el modelo no se apoye en ellas.</p>
        <p>Para evaluar se usa validación cruzada por persona, con 7 particiones: en cada ronda, las personas que se prueban no aparecen en el entrenamiento (salvo algunos hablantes de HISPASpoof, ver limitaciones), y así cada audio en español se prueba una vez sin haber sido visto. Además se probó con voces creadas por herramientas que el modelo nunca vio: fish-speech y xtts-v1.</p>
        <p>Cada red se entrena en tres condiciones, que el sistema muestra por separado: <strong>A</strong>, preentrenada con audios multilingües y sin conocer español; <strong>B</strong>, preentrenada y afinada con español, que es el resultado principal; y <strong>C</strong>, entrenada solo con español, como punto de comparación. Los resultados de B y C promedian siete modelos, uno por partición.</p>
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
        <p>Cada modelo muestra la clase que considera más probable y su porcentaje. Por ejemplo, «78 % voz falsa» significa que el modelo asigna 78 % a que la voz es falsa y 22 % a que es real. Los porcentajes se calibran con datos de validación, de modo que 50 % es el punto en el que cada modelo cambia de opinión.</p>
        <p>Es normal que la CNN y la LSTM no siempre coincidan: analizan el audio de formas distintas, y por eso se comparan. Si el audio dura más de 10 segundos, se analizan hasta 8 fragmentos y se promedian sus resultados; si dura menos, se repite su contenido hasta completar la ventana de análisis. Antes del análisis, todos los audios se llevan a la misma banda de frecuencias (hasta 8 kHz), para que una nota de voz de celular y una grabación de estudio sean comparables.</p>
        <p>El botón «Ver otras condiciones» muestra cómo responden las versiones A y C de cada modelo. Sirven para comparar, no son el resultado principal.</p>
        <p>El porcentaje es la confianza del modelo, no una certeza: ningún resultado es definitivo.</p>
      </>
    ),
  },
  {
    t: '¿Qué limitaciones tiene?',
    d: 'Lo que conviene tener presente antes de confiar en un resultado.',
    body: (
      <dl className="facts">
        <div><dt>Voces de herramientas nuevas</dt><dd>Con voces creadas por herramientas que no estaban en el entrenamiento (fish-speech y xtts-v1), la exactitud bajó a cerca de 93 % en la CNN y 82 % en la LSTM (condiciones B y C).</dd></div>
        <div><dt>Audios de celular</dt><dd>Con notas de voz de celular, el sistema todavía marca como falsas algunas voces reales: acepta como reales cerca del 62 % de las que probamos. Son pocas decenas de audios, así que la cifra es aproximada. Por eso conviene mirar el porcentaje y no solo la etiqueta.</dd></div>
        <div><dt>La LSTM es menos confiable</dt><dd>En las pruebas, la CNN superó a la LSTM de forma significativa, así que la LSTM puede fallar más, sobre todo con audios distintos a los del entrenamiento. La condición A (modelo base) detecta pocas voces falsas en español y no debe tomarse como resultado final.</dd></div>
        <div><dt>Tipos de síntesis</dt><dd>Los modelos solo conocen los métodos de generación presentes en sus datos. Con técnicas nuevas, el desempeño puede caer.</dd></div>
        <div><dt>Condiciones de grabación</dt><dd>Un diagnóstico del proyecto mostró que, en español, las voces reales y falsas también se distinguen por el ruido de fondo y la calidad de la grabación, no solo por la voz. Por eso se simulan distintas condiciones al entrenar, pero con grabaciones muy distintas el modelo aún puede fallar.</dd></div>
        <div><dt>Datos y entrenamiento</dt><dd>El conjunto HISPASpoof comparte 24 hablantes entre sus particiones, así que la prueba con herramientas de voz nuevas es más fiable que la de hablantes. Además, los modelos se entrenaron con una sola semilla, por lo que no medimos cuánto varían los resultados entre entrenamientos.</dd></div>
        <div><dt>Confianza, no certeza</dt><dd>Los porcentajes indican qué tan seguro está cada modelo, no la certeza de que el audio sea real o falso.</dd></div>
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
    <section className="split">
      <div className="pane pane--color about-intro">
        <h1 className="display display--md">Acerca del proyecto</h1>
        <span className="rule" />
        <p className="lead">Detección de audios deepfake con una CNN y una LSTM.</p>
      </div>
      <div className="pane pane--light">
        <div className="acc">
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
        </div>
      </div>
    </section>
  );
}

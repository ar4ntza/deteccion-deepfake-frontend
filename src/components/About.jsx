const SECTIONS = [
  ['¿De qué trata el proyecto?', 'Texto de relleno. Aquí describe el problema de las voces sintéticas y por qué es importante detectarlas.'],
  ['Datos y modelos', 'Texto de relleno. Aquí explica los audios usados, el preentrenamiento multilingüe, la adaptación al español y la diferencia entre la CNN y la LSTM.'],
  ['Cómo interpretar los resultados', 'Texto de relleno. Aquí explica qué significa cada porcentaje y qué tan confiable es.'],
  ['Limitaciones', 'Texto de relleno. Aquí menciona el tamaño del conjunto de prueba, los tipos de síntesis conocidos y las probabilidades sobreconfiadas.'],
  ['Equipo y contacto', 'Texto de relleno. Nombres, asesor, institución y correo de contacto.'],
];

export default function About() {
  return (
    <div className="about-wrap">
      <article className="glass about">
        <h2>Acerca del proyecto</h2>
        {SECTIONS.map(([title, text]) => (
          <section key={title}><h3>{title}</h3><p>{text}</p></section>
        ))}
      </article>
    </div>
  );
}

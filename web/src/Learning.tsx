import { useState } from 'react';

const topics = [
  { title: 'Guía de comandos', formula: 'x^2 · sqrt(x) · sin(x)', theory: 'Escribe las funciones con x como variable. Usa ^ para potencias, * para multiplicar y paréntesis en funciones.', example: 'x^2+2*x+1, sqrt(x), sin(x)' },
  { title: 'Funciones lineales', formula: 'y = mx + b', theory: 'Una función lineal tiene cambio constante. m es la pendiente y b el punto donde corta el eje vertical.', example: 'y=2x+1: cuando x aumenta 1, y aumenta 2.' },
  { title: 'Ecuaciones cuadráticas', formula: 'y = ax² + bx + c', theory: 'Su gráfica es una parábola. El signo de a determina si abre hacia arriba o hacia abajo.', example: 'y=x^2-4: la parábola corta el eje vertical en -4.' },
  { title: 'Trigonometría', formula: 'sin(x), cos(x), tan(x)', theory: 'Las funciones trigonométricas relacionan ángulos y lados y permiten representar fenómenos periódicos.', example: 'y=sin(x) oscila entre -1 y 1.' },
  { title: 'Cálculo básico', formula: "f'(x), ∫f(x)dx", theory: 'La derivada representa cambio instantáneo; la integral, acumulación.', example: "Si f(x)=x², entonces f'(x)=2x." },
];

export default function Learning({ onGraph }: { onGraph: (expression: string) => void }) {
  const [selected, setSelected] = useState(0);
  const topic = topics[selected];
  return <div className="two-column learning-layout">
    <section className="panel">
      <div className="section-heading"><div><span className="eyebrow">Biblioteca</span><h2>Aprendizaje rápido</h2></div></div>
      <div className="topic-list">{topics.map((item, index) => <button className={selected === index ? 'topic active' : 'topic'} key={item.title} onClick={() => setSelected(index)}>{item.title}<span>→</span></button>)}</div>
    </section>
    <section className="panel topic-detail">
      <span className="eyebrow">Concepto matemático</span><h2>{topic.title}</h2>
      <div className="formula-box">{topic.formula}</div>
      <h3>¿Qué significa?</h3><p>{topic.theory}</p>
      <h3>Ejemplo</h3><p>{topic.example}</p>
      {selected === 1 && <button onClick={() => onGraph('2x+1')}>Graficar ejemplo</button>}
      {selected === 2 && <button onClick={() => onGraph('x^2-4')}>Graficar ejemplo</button>}
      {selected === 3 && <button onClick={() => onGraph('sin(x)')}>Graficar ejemplo</button>}
    </section>
  </div>;
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { compileFunction } from './math';

type Curve = { id: number; expression: string; color: string; visible: boolean };
type HistoryItem = { expression: string; createdAt: string };
const palette = ['#00c2ff', '#ff6b6b', '#ffd93d', '#6bcb77', '#a66cff', '#ff9f1c'];
const width = 760;
const height = 420;

function readHistory(userId: number): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(`mathoff-history-${userId}`) || '[]') as HistoryItem[]; }
  catch { return []; }
}

export default function Graph({ incoming, userId }: { incoming: { expression: string; id: number } | null; userId: number }) {
  const [input, setInput] = useState('');
  const [curves, setCurves] = useState<Curve[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>(() => readHistory(userId));
  const [scale, setScale] = useState(28);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const consumedIncoming = useRef<number | null>(null);

  useEffect(() => { setHistory(readHistory(userId)); setCurves([]); }, [userId]);

  function add(expression: string) {
    try {
      compileFunction(expression);
      setCurves(previous => [{ id: Date.now() + Math.random(), expression, color: palette[previous.length % palette.length], visible: true }, ...previous]);
      const updated = [{ expression, createdAt: new Date().toISOString() }, ...readHistory(userId)].slice(0, 40);
      setHistory(updated);
      localStorage.setItem(`mathoff-history-${userId}`, JSON.stringify(updated));
      setInput('');
      setError('');
    } catch { setError('Expresión inválida. Prueba con 2x+1, x^2 o sin(x).'); }
  }

  useEffect(() => {
    if (incoming && incoming.id !== consumedIncoming.current) {
      consumedIncoming.current = incoming.id;
      add(incoming.expression);
    }
  }, [incoming?.id]);

  const paths = useMemo(() => curves.filter(curve => curve.visible).map(curve => {
    const fn = compileFunction(curve.expression);
    let path = '';
    let connected = false;
    let lastY = 0;
    for (let px = 0; px <= width; px += 2) {
      const x = (px - width / 2 - offset.x) / scale;
      let y: number;
      try { y = fn(x); } catch { connected = false; continue; }
      const py = height / 2 + offset.y - y * scale;
      if (!Number.isFinite(py) || Math.abs(py) > height * 4 || (connected && Math.abs(py - lastY) > height)) {
        connected = false; continue;
      }
      path += `${connected ? 'L' : 'M'}${px},${py} `;
      connected = true;
      lastY = py;
    }
    return { ...curve, path };
  }), [curves, scale, offset]);

  const grid = [];
  for (let x = (width / 2 + offset.x) % scale; x < width; x += scale) grid.push(<line key={`x${x}`} x1={x} y1="0" x2={x} y2={height} />);
  for (let y = (height / 2 + offset.y) % scale; y < height; y += scale) grid.push(<line key={`y${y}`} x1="0" y1={y} x2={width} y2={y} />);

  return <div className="two-column">
    <section className="panel graph-panel">
      <div className="section-heading"><div><span className="eyebrow">Explora</span><h2>Graficador de funciones</h2></div><p>Escribe una función de x.</p></div>
      <form className="graph-input" onSubmit={event => { event.preventDefault(); add(input); }}>
        <input aria-label="Función matemática" placeholder="Ejemplo: x^2+2*x+1" value={input} onChange={event => setInput(event.target.value)} />
        <button>Graficar</button>
      </form>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="plot-frame">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Plano cartesiano con funciones"
          onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: event.clientX - offset.x, y: event.clientY - offset.y }); }}
          onPointerMove={event => { if (drag) setOffset({ x: event.clientX - drag.x, y: event.clientY - drag.y }); }}
          onPointerUp={() => setDrag(null)}>
          <g className="grid-lines">{grid}</g>
          <line className="axis" x1="0" y1={height / 2 + offset.y} x2={width} y2={height / 2 + offset.y} />
          <line className="axis" x1={width / 2 + offset.x} y1="0" x2={width / 2 + offset.x} y2={height} />
          {paths.map(curve => <path key={curve.id} d={curve.path} fill="none" stroke={curve.color} strokeWidth="2.5" />)}
        </svg>
      </div>
      <label className="zoom">Zoom <input type="range" min="10" max="80" value={scale} onChange={event => setScale(Number(event.target.value))} /></label>
      <p className="hint">Arrastra el plano para desplazarte. Ajusta el zoom con el control.</p>
      <div className="curve-list">{curves.map(curve => <div key={curve.id} className="curve-item">
        <button className="curve-toggle" style={{ color: curve.color }} onClick={() => setCurves(previous => previous.map(item => item.id === curve.id ? { ...item, visible: !item.visible } : item))}>
          {curve.visible ? '●' : '○'} {curve.expression}
        </button>
        <button className="text-button" onClick={() => setCurves(previous => previous.filter(item => item.id !== curve.id))}>Eliminar</button>
      </div>)}</div>
    </section>
    <aside className="panel history-panel">
      <div className="section-heading"><div><span className="eyebrow">Tus cálculos</span><h2>Historial</h2></div></div>
      {history.length === 0 ? <p className="muted">Tus funciones graficadas aparecerán aquí.</p> : history.map((item, index) => <div className="history-item" key={`${item.createdAt}-${index}`}>
        <div><strong>{item.expression}</strong><small>{new Date(item.createdAt).toLocaleString('es-CO')}</small></div>
        <div><button className="text-button" onClick={() => add(item.expression)}>Repetir</button><button className="text-button" onClick={() => {
          const updated = history.filter((_, position) => position !== index);
          setHistory(updated); localStorage.setItem(`mathoff-history-${userId}`, JSON.stringify(updated));
        }}>Eliminar</button></div>
      </div>)}
    </aside>
  </div>;
}

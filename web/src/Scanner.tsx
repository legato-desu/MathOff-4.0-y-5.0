import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { compileFunction } from './math';

type Props = { onGraph: (expression: string) => void };

export default function Scanner({ onGraph }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [image, setImage] = useState<Blob | null>(null);
  const [preview, setPreview] = useState('');
  const [expression, setExpression] = useState('');
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (image) return;
    let cancelled = false;
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('La cámara requiere abrir la web en localhost o mediante HTTPS.');
        }
        const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (cancelled) { media.getTracks().forEach(track => track.stop()); return; }
        stream.current = media;
        if (video.current) video.current.srcObject = media;
        setReady(true);
        setError('');
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo abrir la cámara.');
      }
    }
    start();
    return () => {
      cancelled = true;
      stream.current?.getTracks().forEach(track => track.stop());
      stream.current = null;
      setReady(false);
    };
  }, [image]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function capture() {
    if (!video.current?.videoWidth) { setError('La cámara todavía está iniciando.'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.current.videoWidth;
    canvas.height = video.current.videoHeight;
    canvas.getContext('2d')?.drawImage(video.current, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) { setError('No se pudo tomar la foto.'); return; }
      setImage(blob);
      setPreview(URL.createObjectURL(blob));
      setExpression('');
      setRaw('');
      setError('');
    }, 'image/jpeg', 0.88);
  }

  async function recognize() {
    if (!image) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', image, 'equation.jpg');
      const result = await api('/math/scan/', { method: 'POST', body: form });
      setRaw(result.raw_text || '');
      setExpression(result.expression || '');
      if (!result.expression) setError('No se detectó una expresión; prueba otra foto o escríbela.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo leer la imagen.');
    } finally { setBusy(false); }
  }

  function graph() {
    try {
      compileFunction(expression);
      onGraph(expression.trim());
    } catch {
      setError('Corrige la expresión. Ejemplo: x^2+2*x+1');
    }
  }

  return <section className="panel scanner">
    <div className="section-heading"><div><span className="eyebrow">Cámara</span><h2>Escáner de ecuaciones</h2></div><p>Enfoca una sola función sobre un fondo uniforme.</p></div>
    {!image ? <>
      <div className="camera-frame"><video ref={video} autoPlay muted playsInline aria-label="Vista de cámara" /></div>
      <div className="actions"><button onClick={capture} disabled={!ready}>Tomar foto</button></div>
    </> : <>
      <img className="photo-preview" src={preview} alt="Ecuación fotografiada" />
      <div className="actions"><button onClick={recognize} disabled={busy}>{busy ? 'Reconociendo…' : 'Reconocer ecuación'}</button></div>
      {raw && <p className="muted">Texto detectado: <code>{raw}</code></p>}
      <label className="field">Revisa la expresión antes de graficar
        <input value={expression} onChange={event => setExpression(event.target.value)} placeholder="Ejemplo: x^2+2*x+1" />
      </label>
      <div className="actions">
        <button onClick={graph} disabled={busy}>Graficar expresión</button>
        <button className="secondary" onClick={() => { setImage(null); setExpression(''); setRaw(''); setError(''); }}>Tomar otra foto</button>
      </div>
    </>}
    {error && <p role="alert" className="error">{error}</p>}
    <p className="hint">El reconocimiento aún puede confundir exponentes y símbolos manuscritos. Verifica el resultado antes de usarlo.</p>
  </section>;
}

import { useEffect, useState } from 'react';
import { api, login, readSession, register, saveSession, type Session } from './api';
import Dashboard from './Dashboard';
import Graph from './Graph';
import Learning from './Learning';
import Scanner from './Scanner';

type Tab = 'Inicio' | 'Escáner' | 'Graficador' | 'Biblioteca' | 'Perfil' | 'Opciones';
const icons: Record<Tab, string> = { Inicio: '⌂', Escáner: '▣', Graficador: '⌁', Biblioteca: '▤', Perfil: '♙', Opciones: '⚙' };

export default function App() {
  const [session, setSession] = useState<Session | null>(readSession);
  const [tab, setTab] = useState<Tab>('Inicio');
  const [dark, setDark] = useState(() => localStorage.getItem('mathoff-theme') !== 'light');
  const [authOpen, setAuthOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [incoming, setIncoming] = useState<{ expression: string; id: number } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    const expire = () => { setSession(null); setAuthOpen(true); setAuthError('La sesión expiró. Ingresa de nuevo.'); };
    window.addEventListener('mathoff-session-expired', expire);
    return () => window.removeEventListener('mathoff-session-expired', expire);
  }, []);

  useEffect(() => { localStorage.setItem('mathoff-theme', dark ? 'dark' : 'light'); }, [dark]);

  function navigate(next: Tab) {
    setTab(next);
    if ((next === 'Escáner' || next === 'Graficador' || next === 'Perfil') && !session) setAuthOpen(true);
  }

  function graph(expression: string) {
    setIncoming({ expression, id: Date.now() + Math.random() });
    navigate('Graficador');
  }

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault(); setAuthError(''); setAuthBusy(true);
    try {
      if (registering) {
        await register(username, email, password);
        setRegistering(false); setPassword('');
        setAuthError('Usuario creado. Ahora inicia sesión.');
      } else {
        const next = await login(username, password);
        setSession(next); setAuthOpen(false); setPassword('');
      }
    } catch (cause) { setAuthError(cause instanceof Error ? cause.message : 'No se pudo completar la solicitud.'); }
    finally { setAuthBusy(false); }
  }

  function logout() { saveSession(null); setSession(null); setTab('Inicio'); setAuthOpen(false); }

  return <div className={dark ? 'app dark' : 'app light'}>
    <header className="topbar"><button className="brand" onClick={() => navigate('Inicio')}><span>✦</span> MathOff</button>
      <div className="top-actions">{session ? <><span className="account-tag">{session.user.username} · {session.user.role || 'Sin rol'}</span><button className="secondary small" onClick={logout}>Salir</button></> : <button className="small" onClick={() => setAuthOpen(true)}>Iniciar sesión</button>}</div>
    </header>

    <nav className="navigation" aria-label="Navegación principal">
      {(['Inicio', 'Escáner', 'Graficador', 'Biblioteca', ...(session ? ['Perfil'] : []), 'Opciones'] as Tab[]).map(item =>
        <button key={item} className={tab === item ? 'nav-item active' : 'nav-item'} onClick={() => navigate(item)}><span>{icons[item]}</span>{item}</button>)}
    </nav>

    <main className="main-content">
      {tab === 'Inicio' && <section className="hero panel"><div className="hero-copy"><span className="eyebrow">Aprende matemáticas</span><h1>Descubre lo que cuentan las <em>funciones.</em></h1>
        <p>Escribe una función, toma una foto de una ecuación o explora conceptos matemáticos. Visualiza cada resultado en un plano interactivo.</p>
        <div className="actions"><button onClick={() => navigate('Graficador')}>Abrir graficador →</button><button className="secondary" onClick={() => navigate('Escáner')}>Usar la cámara</button></div>
      </div><div className="hero-art" aria-hidden="true"><div className="formula">y = x² + 2x + 1</div><svg viewBox="0 0 360 230"><line x1="0" y1="170" x2="360" y2="170"/><line x1="180" y1="0" x2="180" y2="230"/><path d="M40 10 Q180 305 320 10" /></svg></div></section>}
      {tab === 'Escáner' && (session ? <Scanner onGraph={graph} /> : <div className="panel gate"><h2>Escáner de ecuaciones</h2><p>Inicia sesión para usar la cámara.</p><button onClick={() => setAuthOpen(true)}>Iniciar sesión</button></div>)}
      {tab === 'Graficador' && (session ? <Graph incoming={incoming} userId={session.user.user_id} /> : <div className="panel gate"><h2>Graficador</h2><p>Inicia sesión para representar funciones.</p><button onClick={() => setAuthOpen(true)}>Iniciar sesión</button></div>)}
      {tab === 'Biblioteca' && <Learning onGraph={graph} />}
      {tab === 'Perfil' && session && <Dashboard user={session.user} />}
      {tab === 'Opciones' && <section className="panel settings"><div className="section-heading"><div><span className="eyebrow">Preferencias</span><h2>Opciones</h2></div></div>
        <label className="setting-row"><span>Tema oscuro</span><input type="checkbox" checked={dark} onChange={event => setDark(event.target.checked)} /></label>
        {session && <><div className="setting-row"><span>Correo electrónico</span><strong>{session.user.email}</strong></div>
          <form className="stack-form password-form" onSubmit={async event => { event.preventDefault(); try { await api('/users/change-password/', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) }); setSettingsMessage('Contraseña actualizada.'); setCurrentPassword(''); setNewPassword(''); } catch (cause) { setSettingsMessage(cause instanceof Error ? cause.message : 'No se pudo cambiar la contraseña.'); } }}>
            <h3>Cambiar contraseña</h3><label className="field">Contraseña actual<input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></label>
            <label className="field">Nueva contraseña<input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required /></label><button>Guardar contraseña</button>
          </form>{settingsMessage && <p role="status">{settingsMessage}</p>}
        </>}
      </section>}
    </main>

    {authOpen && <div className="modal-backdrop" onClick={() => setAuthOpen(false)}><div className="auth-card" role="dialog" aria-modal="true" aria-label={registering ? 'Crear cuenta' : 'Iniciar sesión'} onClick={event => event.stopPropagation()}>
      <button className="close-button" aria-label="Cerrar" onClick={() => setAuthOpen(false)}>×</button>
      <span className="eyebrow">✦ MathOff</span><h2>{registering ? 'Crear cuenta' : 'Bienvenido de nuevo'}</h2>
      <p className="muted">{registering ? 'Regístrate para guardar tu progreso.' : 'Ingresa para usar la cámara y el graficador.'}</p>
      <form className="stack-form" onSubmit={submitAuth}>
        <label className="field">Usuario<input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required /></label>
        {registering && <label className="field">Correo<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>}
        <label className="field">Contraseña<input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete={registering ? 'new-password' : 'current-password'} required /></label>
        <label className="show-password"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} /> Mostrar contraseña</label>
        {authError && <p role="alert" className={authError.startsWith('Usuario creado') ? 'success' : 'error'}>{authError}</p>}
        <button disabled={authBusy}>{authBusy ? 'Espera…' : registering ? 'Registrarse' : 'Iniciar sesión'}</button>
      </form>
      <button className="text-button switch-auth" onClick={() => { setRegistering(!registering); setAuthError(''); }}>{registering ? 'Ya tengo cuenta' : 'Crear una cuenta'}</button>
    </div></div>}
  </div>;
}

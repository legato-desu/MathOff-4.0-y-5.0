import { useEffect, useState } from 'react';
import { api, type User } from './api';

type Role = { id: number; nombre: string; descripcion: string };
type Member = { id: number; username: string; email: string; role: number | null; is_staff: boolean };
type Exercise = { id: number; titulo: string; descripcion: string; funcion_correcta: string };
type Answer = { id: number; ejercicio_titulo: string; estudiante_nombre: string; respuesta_usuario: string; es_correcta: boolean };

export default function Dashboard({ user }: { user: User }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [correct, setCorrect] = useState('');
  const [newRole, setNewRole] = useState('');
  const [reply, setReply] = useState<Record<number, string>>({});

  async function load() {
    try {
      setError('');
      if (user.role === 'Administrador') {
        const [usersData, rolesData, exercisesData, answersData] = await Promise.all([
          api('/users/'), api('/roles/'), api('/ejercicios/'), api('/respuestas/'),
        ]);
        setMembers(usersData); setRoles(rolesData); setExercises(exercisesData); setAnswers(answersData);
      } else if (user.role === 'Docente') {
        const [exercisesData, answersData] = await Promise.all([api('/ejercicios/'), api('/respuestas/')]);
        setExercises(exercisesData); setAnswers(answersData);
      } else if (user.role === 'Estudiante') {
        setExercises(await api('/ejercicios/'));
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los datos.'); }
  }

  useEffect(() => { void load(); }, [user.role]);

  async function run(action: () => Promise<unknown>, success: string) {
    try { setError(''); setMessage(''); await action(); setMessage(success); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo completar la acción.'); }
  }

  return <div className="dashboard">
    <div className="section-heading"><div><span className="eyebrow">Perfil {user.role || 'sin rol'}</span><h2>Hola, {user.username}</h2></div><p>{user.email}</p></div>
    {message && <p className="success" role="status">{message}</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {user.role === 'Administrador' && <div className="dashboard-grid">
      <section className="panel"><h3>Usuarios</h3><p className="muted">{members.length} usuarios registrados</p>
        <div className="record-list">{members.map(member => <div key={member.id} className="record-row"><div><strong>{member.username}</strong><small>{member.email}</small></div>
          <select aria-label={`Rol de ${member.username}`} value={member.role ?? ''} onChange={event => run(() => api(`/users/${member.id}/`, { method: 'PATCH', body: JSON.stringify({ role: event.target.value ? Number(event.target.value) : null }) }), 'Rol actualizado.')}>
            <option value="">Sin rol</option>{roles.map(role => <option key={role.id} value={role.id}>{role.nombre}</option>)}
          </select>
          <button className="text-button" onClick={() => { if (confirm(`¿Eliminar a ${member.username}?`)) void run(() => api(`/users/${member.id}/`, { method: 'DELETE' }), 'Usuario eliminado.'); }}>Eliminar</button>
        </div>)}</div>
      </section>
      <section className="panel"><h3>Roles</h3><form className="inline-form" onSubmit={event => { event.preventDefault(); void run(() => api('/roles/', { method: 'POST', body: JSON.stringify({ nombre: newRole }) }), 'Rol creado.'); setNewRole(''); }}>
        <input aria-label="Nombre del nuevo rol" placeholder="Nombre del rol" value={newRole} onChange={event => setNewRole(event.target.value)} required /><button>Crear</button>
      </form><div className="record-list">{roles.map(role => <div key={role.id} className="record-row"><strong>{role.nombre}</strong>
        <button className="text-button" onClick={() => { const nombre = prompt('Nuevo nombre', role.nombre); if (nombre && nombre !== role.nombre) void run(() => api(`/roles/${role.id}/`, { method: 'PATCH', body: JSON.stringify({ nombre }) }), 'Rol actualizado.'); }}>Editar</button>
        <button className="text-button" onClick={() => { if (confirm(`¿Eliminar el rol ${role.nombre}?`)) void run(() => api(`/roles/${role.id}/`, { method: 'DELETE' }), 'Rol eliminado.'); }}>Eliminar</button>
      </div>)}</div></section>
    </div>}

    {user.role === 'Docente' && <section className="panel"><h3>Crear ejercicio</h3><form className="stack-form" onSubmit={event => { event.preventDefault(); void run(() => api('/ejercicios/', { method: 'POST', body: JSON.stringify({ titulo: title, descripcion: description, funcion_correcta: correct }) }), 'Ejercicio creado.'); setTitle(''); setDescription(''); setCorrect(''); }}>
      <label className="field">Título<input value={title} onChange={event => setTitle(event.target.value)} required /></label>
      <label className="field">Descripción<textarea value={description} onChange={event => setDescription(event.target.value)} required /></label>
      <label className="field">Función correcta<input value={correct} onChange={event => setCorrect(event.target.value)} placeholder="Ejemplo: 2x+1" required /></label><button>Guardar ejercicio</button>
    </form></section>}

    {user.role === 'Estudiante' && <section className="panel"><h3>Ejercicios pendientes</h3>
      {exercises.length === 0 && <p className="muted">No hay ejercicios pendientes.</p>}
      <div className="card-grid">{exercises.map(exercise => <article key={exercise.id} className="small-card"><h4>{exercise.titulo}</h4><p>{exercise.descripcion}</p>
        <form className="inline-form" onSubmit={event => { event.preventDefault(); void run(() => api('/respuestas/crear/', { method: 'POST', body: JSON.stringify({ ejercicio: exercise.id, respuesta_usuario: reply[exercise.id] }) }), 'Respuesta enviada.'); }}>
          <input aria-label={`Respuesta a ${exercise.titulo}`} placeholder="Tu función" value={reply[exercise.id] || ''} onChange={event => setReply(previous => ({ ...previous, [exercise.id]: event.target.value }))} required /><button>Enviar</button>
        </form></article>)}</div>
    </section>}

    {user.role !== 'Estudiante' && <section className="panel"><h3>Ejercicios</h3><div className="record-list">{exercises.map(exercise => <div key={exercise.id} className="record-row"><div><strong>{exercise.titulo}</strong><small>{exercise.descripcion}</small></div><span className="pill">{exercise.funcion_correcta}</span>
      {user.role === 'Administrador' && <button className="text-button" onClick={() => { if (confirm(`¿Eliminar ${exercise.titulo}?`)) void run(() => api(`/ejercicios/${exercise.id}/`, { method: 'DELETE' }), 'Ejercicio eliminado.'); }}>Eliminar</button>}
    </div>)}</div></section>}

    {user.role !== 'Estudiante' && <section className="panel"><h3>Respuestas</h3><div className="record-list">{answers.map(answer => <div key={answer.id} className="record-row"><div><strong>{answer.ejercicio_titulo}</strong><small>{answer.estudiante_nombre}: {answer.respuesta_usuario}</small></div><span className={answer.es_correcta ? 'pill success-pill' : 'pill error-pill'}>{answer.es_correcta ? 'Correcta' : 'Incorrecta'}</span></div>)}</div></section>}
  </div>;
}

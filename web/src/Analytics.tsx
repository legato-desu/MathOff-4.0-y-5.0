import { useCallback, useEffect, useState } from 'react';
import { api, type User } from './api';

type DashboardData = {
  generado_en: string;
  periodo_desde: string;
  resumen: { usuarios: number; usuarios_activos: number; ejercicios: number; respuestas: number; correctas: number; incorrectas: number; tasa_acierto: number };
  actividad_por_mes: { mes: string; total: number; correctas: number }[];
  ejercicios_destacados: { id: number; titulo: string; intentos: number; correctas: number; porcentaje_acierto: number }[];
  distribucion_roles: { rol: string; total: number }[];
  ultimas_respuestas: { id: number; estudiante: string; ejercicio: string; correcta: boolean; fecha: string }[];
};

const number = (value: number) => new Intl.NumberFormat('es-CO').format(value);
const monthName = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' }).format(new Date(year, month - 1, 1));
};

export default function Analytics({ user }: { user: User }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api('/estadisticas/'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const summary = data?.resumen;
  const maxMonthly = Math.max(1, ...(data?.actividad_por_mes.map(item => item.total) ?? [1]));
  const maxExercise = Math.max(1, ...(data?.ejercicios_destacados.map(item => item.intentos) ?? [1]));
  const maxRole = Math.max(1, ...(data?.distribucion_roles.map(item => item.total) ?? [1]));

  return <div className="analytics-page">
    <section className="analytics-heading">
      <div><span className="eyebrow">MathOff · análisis exploratorio</span><h2>Centro de analítica</h2>
        <p>Una vista general de usuarios, actividad y resultados registrados en la plataforma.</p></div>
      <button className="analytics-refresh" onClick={() => void load()} disabled={loading}>{loading ? 'Actualizando…' : '↻ Actualizar datos'}</button>
    </section>

    {error && <div className="analytics-alert" role="alert"><strong>No fue posible cargar el dashboard.</strong><span>{error}</span><button className="secondary small" onClick={() => void load()}>Reintentar</button></div>}
    {loading && !data && <section className="panel analytics-loading"><span className="analytics-spinner"/><strong>Consultando datos reales…</strong><span className="muted">Estamos obteniendo las estadísticas desde Django.</span></section>}
    {!loading && !data && !error && <section className="panel"><p>No hay información disponible todavía.</p></section>}

    {data && <>
      <div className="analytics-meta"><span><span className="status-dot"/> Datos conectados al backend</span><span>Periodo de actividad desde {data.periodo_desde}</span><span>Actualizado: {data.generado_en}</span></div>
      <section className="analytics-kpis" aria-label="Indicadores principales">
        <article className="analytics-kpi"><div className="kpi-icon kpi-blue">♙</div><span>Usuarios registrados</span><strong>{number(summary!.usuarios)}</strong><small>{number(summary!.usuarios_activos)} cuentas activas</small></article>
        <article className="analytics-kpi"><div className="kpi-icon kpi-violet">⌘</div><span>Ejercicios disponibles</span><strong>{number(summary!.ejercicios)}</strong><small>Contenido registrado</small></article>
        <article className="analytics-kpi"><div className="kpi-icon kpi-cyan">↗</div><span>Respuestas registradas</span><strong>{number(summary!.respuestas)}</strong><small>{number(summary!.correctas)} correctas · {number(summary!.incorrectas)} por mejorar</small></article>
        <article className="analytics-kpi"><div className="kpi-icon kpi-green">✓</div><span>Tasa de acierto</span><strong>{summary!.tasa_acierto}%</strong><small>Sobre todas las respuestas guardadas</small><div className="kpi-progress"><span style={{ width: `${summary!.tasa_acierto}%` }}/></div></article>
      </section>

      <section className="analytics-panels">
        <article className="analytics-card analytics-wide"><div className="analytics-card-title"><div><span className="eyebrow">Tendencia</span><h3>Actividad mensual</h3></div><span className="chart-legend"><i/> Respuestas <i className="legend-green"/> Correctas</span></div>
          {data.actividad_por_mes.length ? <div className="monthly-chart" role="img" aria-label="Gráfica de respuestas totales y correctas por mes">{data.actividad_por_mes.map(item => <div className="month-column" key={item.mes} title={`${monthName(item.mes)}: ${item.total} respuestas, ${item.correctas} correctas`}><div className="month-bars"><span className="month-bar total-bar" style={{ height: `${Math.max(4, item.total / maxMonthly * 100)}%` }}/><span className="month-bar correct-bar" style={{ height: `${Math.max(4, item.correctas / maxMonthly * 100)}%` }}/></div><strong>{number(item.total)}</strong><small>{monthName(item.mes)}</small></div>)}</div> : <div className="analytics-empty"><span>▥</span><strong>Aún no hay actividad mensual</strong><p>Cuando los estudiantes envíen respuestas, la tendencia aparecerá aquí.</p></div>}
          <p className="analytics-note">Se muestran los meses con respuestas registradas dentro del periodo analizado. Los meses sin registros no se inventan.</p>
        </article>

        <article className="analytics-card"><div className="analytics-card-title"><div><span className="eyebrow">Composición</span><h3>Usuarios por rol</h3></div></div>
          {data.distribucion_roles.length ? <div className="role-bars">{data.distribucion_roles.map(item => <div className="role-row" key={item.rol}><div className="role-label"><span>{item.rol}</span><strong>{number(item.total)}</strong></div><div className="role-track"><span style={{ width: `${item.total / maxRole * 100}%` }}/></div></div>)}</div> : <div className="analytics-empty"><strong>Sin usuarios para clasificar</strong></div>}
          <p className="analytics-note">La clasificación se basa en el rol guardado en cada cuenta.</p>
        </article>

        <article className="analytics-card analytics-wide"><div className="analytics-card-title"><div><span className="eyebrow">Participación</span><h3>Ejercicios con más intentos</h3></div><span className="muted small-label">Top 6</span></div>
          {data.ejercicios_destacados.length ? <div className="exercise-ranking">{data.ejercicios_destacados.map((item, index) => <div className="exercise-rank" key={item.id}><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><div className="rank-main"><div className="rank-title"><strong>{item.titulo}</strong><span>{number(item.intentos)} intentos</span></div><div className="rank-track"><span style={{ width: `${item.intentos / maxExercise * 100}%` }}/></div></div><div className="rank-score"><strong>{item.porcentaje_acierto}%</strong><small>acierto</small></div></div>)}</div> : <div className="analytics-empty"><span>⌁</span><strong>Sin ejercicios con respuestas</strong><p>Esta sección se completará al registrar actividad de estudiantes.</p></div>}
        </article>

        <article className="analytics-card"><div className="analytics-card-title"><div><span className="eyebrow">Registro reciente</span><h3>Últimas respuestas</h3></div></div>
          {data.ultimas_respuestas.length ? <div className="recent-list">{data.ultimas_respuestas.map(item => <div className="recent-item" key={item.id}><span className={item.correcta ? 'recent-status is-correct' : 'recent-status is-wrong'}>{item.correcta ? '✓' : '×'}</span><div className="recent-copy"><strong>{item.ejercicio}</strong><span>{item.estudiante} · {item.fecha}</span></div><span className={item.correcta ? 'result-tag good' : 'result-tag bad'}>{item.correcta ? 'Correcta' : 'Incorrecta'}</span></div>)}</div> : <div className="analytics-empty"><span>◷</span><strong>Sin respuestas recientes</strong><p>Los registros aparecerán cuando haya respuestas guardadas.</p></div>}
        </article>
      </section>

      <section className="analytics-insight"><div className="insight-symbol">+</div><div><span className="eyebrow">Lectura de los datos</span><h3>¿Qué nos dicen estas métricas?</h3><p>El panel resume el volumen de uso, la distribución de cuentas y los resultados de los ejercicios. Compara la tasa de acierto con la participación por ejercicio para identificar temas que podrían necesitar refuerzo. Si hay pocos registros, interpreta las tendencias con cautela.</p></div></section>
      <footer className="analytics-footer">Panel de análisis exploratorio · MathOff · Usuario: {user.username} · Las métricas se calculan a partir de los registros existentes.</footer>
    </>}
  </div>;
}

// Código compartido por todas las páginas de la app.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY, DOMINIO_ALUMNOS } from './config.js';
import { EJERCICIOS, formatoValor } from './ejercicios.js';
import { iniciarIdiomas, idiomasGuardados, recordarIdiomas, traducirPagina, selectoresIdioma, idiomaPrincipal, idiomaSecundario, t, t1, tPlano, NINGUNO } from './i18n.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Los idiomas se cargan antes que nada: así cualquier página puede usar t() desde el principio.
await iniciarIdiomas(idiomasGuardados());
traducirPagina();

// ---------- Sesión ----------

export function emailDe(usuario) {
  const u = usuario.trim().toLowerCase();
  return u.includes('@') ? u : `${u}@${DOMINIO_ALUMNOS}`;
}

export async function entrar(usuario, password) {
  const { error } = await sb.auth.signInWithPassword({ email: emailDe(usuario), password });
  if (error) throw new Error(t('entrar.error'));
}

export async function salir() {
  await sb.auth.signOut();
  location.href = 'index.html';
}

let perfilCache = null;
export async function miPerfil() {
  if (perfilCache) return perfilCache;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const campos = 'id, usuario, apodo, rol, curso_id, cursos(nombre)';
  let { data, error } = await sb.from('perfiles')
    .select(campos + ', idioma, idioma2').eq('id', session.user.id).single();
  // Si aún no se han creado las columnas de idioma en Supabase, sin ellas
  if (error) ({ data, error } = await sb.from('perfiles').select(campos).eq('id', session.user.id).single());
  if (error) return null;
  perfilCache = data;
  // Si hay que recargar para cambiar de idioma, no se sigue pintando nada
  if (sincronizarIdiomas(data)) await new Promise(() => {});
  return data;
}

// Para páginas que necesitan sesión: si no hay, vuelve al inicio.
export async function exigirSesion({ admin = false } = {}) {
  const p = await miPerfil();
  if (!p || (admin && p.rol !== 'admin')) {
    location.href = 'index.html';
    throw new Error('sin sesión');
  }
  pintarCabecera(p);
  return p;
}

// ---------- Idiomas ----------

// Si el perfil tiene idiomas guardados y no son los de este ordenador, manda el perfil.
// Se recarga la página para que todo salga ya en el idioma bueno.
function sincronizarIdiomas(p) {
  if (!p.idioma) return false;
  const s = p.idioma2 || idiomasGuardados().secundario;
  if (p.idioma !== idiomaPrincipal() || (s === NINGUNO ? null : s) !== idiomaSecundario()) {
    const ya = sessionStorage.getItem('taller-idiomas-recarga');
    recordarIdiomas(p.idioma, s);
    if (!ya) { sessionStorage.setItem('taller-idiomas-recarga', '1'); location.reload(); return true; }
  }
  sessionStorage.removeItem('taller-idiomas-recarga');
  return false;
}

// Guarda los idiomas en este ordenador y, si hay sesión, en el perfil. Después recarga.
export async function cambiarIdiomas(principal, secundario) {
  recordarIdiomas(principal, secundario);
  const p = await miPerfil();
  if (p && 'idioma' in p) {
    const { error } = await sb.rpc('cambiar_idiomas', { p_idioma: principal, p_idioma2: secundario || NINGUNO });
    if (error) console.error(error);
  }
  location.reload();
}

// Pinta los selectores de idioma dentro de "caja" y los conecta
export function montarSelectoresIdioma(caja) {
  caja.innerHTML = selectoresIdioma();
  const cambio = () => cambiarIdiomas(caja.querySelector('#sel-idioma').value, caja.querySelector('#sel-idioma2').value);
  caja.querySelector('#sel-idioma').onchange = cambio;
  caja.querySelector('#sel-idioma2').onchange = cambio;
}

export function pintarCabecera(p) {
  const el = document.getElementById('cabecera');
  if (!el) return;
  const enInicio = /\/(index\.html)?$/.test(location.pathname);
  const codigos = [idiomaPrincipal(), idiomaSecundario()].filter(Boolean).map(c => c.toUpperCase()).join(' · ');
  el.innerHTML = `
    ${enInicio ? '<span></span>' : `<a href="index.html">${document.documentElement.dir === 'rtl' ? '→' : '←'} ${t('cab.fichas')}</a>`}
    <span class="quien">${esc(p.apodo)}${p.cursos ? ` · <span class="muted">${esc(p.cursos.nombre)}</span>` : ''}</span>
    <span class="acciones">
      ${p.rol === 'admin' ? `<a href="admin.html">${t1('cab.admin')}</a>` : ''}
      <button class="ghost" id="btn-idioma" title="${tPlano('idioma.titulo')}" aria-expanded="false">🌐 ${codigos}</button>
      <button class="ghost" id="btn-sonido"></button>
      <button class="ghost" id="btn-salir">${t('cab.salir')}</button>
    </span>
    <div class="panel-idiomas oculto" id="panel-idiomas"></div>`;
  el.querySelector('#btn-salir').onclick = salir;
  const panel = el.querySelector('#panel-idiomas');
  el.querySelector('#btn-idioma').onclick = e => {
    const abierto = panel.classList.toggle('oculto') === false;
    e.currentTarget.setAttribute('aria-expanded', abierto);
    if (abierto) montarSelectoresIdioma(panel);
  };
  const bs = el.querySelector('#btn-sonido');
  const pintar = () => { bs.textContent = silencio() ? '🔇' : '🔊'; bs.title = tPlano(silencio() ? 'cab.sonidoOn' : 'cab.sonidoOff'); };
  bs.onclick = () => { localStorage.setItem('taller-silencio', silencio() ? '0' : '1'); pintar(); if (!silencio()) sonar('ok'); };
  pintar();
}

// ---------- Resultados ----------

export async function guardarIntento(intento) {
  const { error } = await sb.from('intentos').insert(intento);
  if (error) console.error(error);
  return !error;
}

export async function misMejores() {
  // Mejor marca propia por ejercicio, calculada en el navegador.
  const { data } = await sb.from('intentos')
    .select('ejercicio, valor, acierto').eq('alumno_id', (await miPerfil()).id);
  return data || [];
}

// ---------- Récords personales ----------

// ¿valor mejora la marca previa? (sin marca previa, sí)
export function mejora(ej, valor, previo) {
  return previo == null || (ej.menorMejor ? valor < previo : valor > previo);
}

// Mejor marca por ejercicio. "aceptar" descarta intentos que no cuentan.
export function calcularRecords(intentos, aceptar = () => true) {
  const r = {};
  for (const i of intentos) {
    const ej = EJERCICIOS[i.ejercicio];
    if (!ej || !aceptar(i)) continue;
    const v = Number(i.valor);
    if (mejora(ej, v, r[i.ejercicio])) r[i.ejercicio] = v;
  }
  return r;
}

// Mensaje al terminar una prueba, comparando con el récord anterior.
export function mensajeRecord(ej, valor, previo) {
  if (previo == null) return '🏅 ' + t('record.primero');
  if (mejora(ej, valor, previo))
    return `<span class="record-nuevo">🏆 ${t('record.nuevo')}</span> <span class="muted">(${t1('record.antes')} ${formatoValor(ej, previo)})</span>`;
  return t('record.sigue', { marca: formatoValor(ej, previo) });
}

// ---------- Sonidos y celebración ----------
// Sonidos generados en el navegador (sin archivos). Se pueden quitar con 🔊 en la cabecera.

export const silencio = () => localStorage.getItem('taller-silencio') === '1';
let audio = null;

function nota(freq, cuando, dur, tipo = 'sine', vol = 0.2) {
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = tipo; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, cuando);
  g.gain.exponentialRampToValueAtTime(vol, cuando + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, cuando + dur);
  o.connect(g).connect(audio.destination);
  o.start(cuando); o.stop(cuando + dur + 0.05);
}

// tipo: 'ok' (prueba superada), 'fallo' (no superada), 'record' (récord nuevo)
export function sonar(tipo) {
  if (silencio()) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const t = audio.currentTime + 0.02;
    if (tipo === 'ok') { nota(660, t, 0.15); nota(990, t + 0.13, 0.3); }
    if (tipo === 'fallo') { nota(392, t, 0.25, 'triangle', 0.25); nota(262, t + 0.25, 0.5, 'triangle', 0.25); }
    if (tipo === 'record') {
      [523, 659, 784].forEach((f, i) => nota(f, t + i * 0.12, 0.16, 'square', 0.07));
      nota(1047, t + 0.36, 0.6, 'square', 0.07);
      nota(1319, t + 0.36, 0.6, 'sine', 0.12);
    }
  } catch { /* sin audio: no pasa nada */ }
}

// Lluvia de confeti por toda la pantalla durante unos segundos
export function celebrar() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const capa = document.createElement('div');
  capa.className = 'confeti';
  const colores = ['#f25c54', '#f7b267', '#ffd166', '#06d6a0', '#118ab2', '#8e7dff', '#ff70a6'];
  for (let i = 0; i < 120; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colores[i % colores.length];
    c.style.setProperty('--x', (Math.random() * 30 - 15) + 'vw');
    c.style.setProperty('--g', (Math.random() * 1440 - 720) + 'deg');
    c.style.setProperty('--d', (2 + Math.random() * 1.8) + 's');
    c.style.setProperty('--r', (Math.random() * 0.8) + 's');
    if (i % 3 === 0) c.style.borderRadius = '50%';
    capa.appendChild(c);
  }
  document.body.appendChild(capa);
  setTimeout(() => capa.remove(), 4800);
}

// ---------- Utilidades ----------

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function fmt(n, dec = 0) {
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

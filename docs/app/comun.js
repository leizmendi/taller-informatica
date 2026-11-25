// Código compartido por todas las páginas de la app.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY, DOMINIO_ALUMNOS } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Sesión ----------

export function emailDe(usuario) {
  const u = usuario.trim().toLowerCase();
  return u.includes('@') ? u : `${u}@${DOMINIO_ALUMNOS}`;
}

export async function entrar(usuario, password) {
  const { error } = await sb.auth.signInWithPassword({ email: emailDe(usuario), password });
  if (error) throw new Error('Usuario o contraseña incorrectos · Identifiant ou mot de passe incorrect');
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
  const { data, error } = await sb.from('perfiles')
    .select('id, usuario, apodo, rol, curso_id, cursos(nombre)')
    .eq('id', session.user.id).single();
  if (error) return null;
  perfilCache = data;
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

export function pintarCabecera(p) {
  const el = document.getElementById('cabecera');
  if (!el) return;
  const enInicio = /\/(index\.html)?$/.test(location.pathname);
  el.innerHTML = `
    ${enInicio ? '<span></span>' : '<a href="index.html">← Fichas · Fiches</a>'}
    <span class="quien">${esc(p.apodo)}${p.cursos ? ` · <span class="fr">${esc(p.cursos.nombre)}</span>` : ''}</span>
    <span class="acciones">
      ${p.rol === 'admin' ? '<a href="admin.html">Administración</a>' : ''}
      <button class="ghost" id="btn-salir">Salir · Sortir</button>
    </span>`;
  el.querySelector('#btn-salir').onclick = salir;
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

// ---------- Utilidades ----------

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function fmt(n, dec = 0) {
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

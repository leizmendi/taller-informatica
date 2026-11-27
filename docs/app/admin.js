import { sb, exigirSesion, esc } from './comun.js';
import { EN_ADMIN, formatoValor } from './ejercicios.js';

const $ = id => document.getElementById(id);
const yo = await exigirSesion({ admin: true });
const URL_APP = new URL('index.html', location.href).href;

const SIN_CURSO = '__sin__';
let cursos = [];

// ---------- Contraseñas fáciles de dictar ----------
const PALABRAS = ['gato', 'lobo', 'sol', 'luna', 'rio', 'mar', 'pino', 'oso', 'tren', 'nube', 'roca', 'faro', 'puma', 'kiwi', 'lima', 'cielo', 'zorro', 'monte'];
function generar() {
  const p = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
  return `${p}${Math.floor(10 + Math.random() * 90)}${p.length < 4 ? 'x' : ''}`;
}
$('btn-generar').onclick = () => { $('a-pass').value = generar(); };
$('a-pass').value = generar();

function mensaje(txt, error = false) {
  $('msg').textContent = txt;
  $('msg').className = error ? 'error' : 'ok';
}

// ---------- Cursos ----------
async function cargarCursos(elegir) {
  const { data, error } = await sb.from('cursos').select('id, nombre, activo').order('creado', { ascending: false });
  if (error) return mensaje(error.message, true);
  cursos = data;
  $('curso').innerHTML = cursos.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('')
    + `<option value="${SIN_CURSO}">— Sin curso —</option>`;
  if (elegir) $('curso').value = elegir;
  await cargarAlumnos();
}

$('f-curso').onsubmit = async e => {
  e.preventDefault();
  const { data, error } = await sb.from('cursos').insert({ nombre: $('nombre-curso').value.trim() }).select().single();
  if (error) return mensaje(error.message, true);
  $('nombre-curso').value = '';
  await cargarCursos(data.id);
};

$('btn-renombrar').onclick = async () => {
  const id = $('curso').value; if (id === SIN_CURSO) return;
  const actual = cursos.find(c => c.id === id);
  const nombre = prompt('Nuevo nombre del curso', actual?.nombre);
  if (!nombre) return;
  const { error } = await sb.from('cursos').update({ nombre }).eq('id', id);
  if (error) return mensaje(error.message, true);
  await cargarCursos(id);
};

$('curso').onchange = cargarAlumnos;

// ---------- Alumnos ----------
async function cargarAlumnos() {
  const id = $('curso').value;
  $('ver-clasif').href = id && id !== SIN_CURSO ? `clasificacion.html?curso=${id}` : 'clasificacion.html';
  let q = sb.from('perfiles').select('id, usuario, apodo, rol, curso_id').order('apodo');
  q = id === SIN_CURSO || !id ? q.is('curso_id', null) : q.eq('curso_id', id);
  const { data: alumnos, error } = await q;
  if (error) return mensaje(error.message, true);

  // Mejores marcas de las pruebas que clasifican y misiones terminadas
  const ids = alumnos.map(a => a.id);
  const mejores = {};
  if (ids.length) {
    const { data: intentos } = await sb.from('intentos').select('alumno_id, ejercicio, valor').in('alumno_id', ids);
    for (const i of intentos || []) {
      const ej = EN_ADMIN.find(e => e.id === i.ejercicio); if (!ej) continue;
      const k = `${i.alumno_id}|${i.ejercicio}`;
      if (mejores[k] == null || (ej.menorMejor ? i.valor < mejores[k] : i.valor > mejores[k])) mejores[k] = i.valor;
    }
  }

  if (!alumnos.length) { $('alumnos').innerHTML = '<p class="muted">No hay alumnos en este curso.</p>'; return; }
  const opcionesCurso = cursos.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('') + `<option value="">— Sin curso —</option>`;

  $('alumnos').innerHTML = `<table class="tabla">
    <thead><tr><th>Usuario</th><th>Apodo</th>${EN_ADMIN.map(e => `<th class="num">${esc(e.titulo)}</th>`).join('')}<th>Curso</th><th></th></tr></thead>
    <tbody>${alumnos.map(a => `<tr data-id="${a.id}">
      <td><code>${esc(a.usuario)}</code>${a.rol === 'admin' ? ' <span class="muted">(monitor)</span>' : ''}</td>
      <td>${esc(a.apodo)}</td>
      ${EN_ADMIN.map(e => `<td class="num">${formatoValor(e, mejores[`${a.id}|${e.id}`])}</td>`).join('')}
      <td><select class="mover">${opcionesCurso}</select></td>
      <td style="white-space:nowrap">
        <button class="ghost peq" data-acc="apodo">Apodo</button>
        <button class="ghost peq" data-acc="pass">Contraseña</button>
        ${a.id !== yo.id ? `<button class="ghost peq" data-acc="rol">${a.rol === 'admin' ? 'Quitar monitor' : 'Hacer monitor'}</button>` : ''}
        ${a.id !== yo.id ? '<button class="peligro peq" data-acc="borrar">Borrar</button>' : ''}
      </td></tr>`).join('')}</tbody></table>`;

  for (const tr of $('alumnos').querySelectorAll('tr[data-id]')) {
    const a = alumnos.find(x => x.id === tr.dataset.id);
    tr.querySelector('.mover').value = a.curso_id ?? '';
  }
}

$('alumnos').addEventListener('change', async e => {
  if (!e.target.classList.contains('mover')) return;
  const id = e.target.closest('tr').dataset.id;
  const { error } = await sb.from('perfiles').update({ curso_id: e.target.value || null }).eq('id', id);
  if (error) return mensaje(error.message, true);
  mensaje('Alumno cambiado de curso');
  cargarAlumnos();
});

$('alumnos').addEventListener('click', async e => {
  const b = e.target.closest('button[data-acc]'); if (!b) return;
  const tr = b.closest('tr'); const id = tr.dataset.id;
  const usuario = tr.querySelector('code').textContent;

  if (b.dataset.acc === 'apodo') {
    const apodo = prompt('Nuevo apodo', tr.children[1].textContent);
    if (!apodo) return;
    const { error } = await sb.from('perfiles').update({ apodo: apodo.trim() }).eq('id', id);
    if (error) return mensaje(error.message, true);
    cargarAlumnos();
  }
  if (b.dataset.acc === 'pass') {
    const pass = prompt(`Nueva contraseña para ${usuario}`, generar());
    if (!pass) return;
    const { error } = await sb.rpc('admin_cambiar_password', { p_alumno: id, p_password: pass });
    if (error) return mensaje(error.message, true);
    añadirTarjeta(usuario, pass);
    mensaje(`Contraseña cambiada para ${usuario}`);
  }
  if (b.dataset.acc === 'rol') {
    const a = await sb.from('perfiles').select('rol').eq('id', id).single();
    if (a.error) return mensaje(a.error.message, true);
    const nuevo = a.data.rol === 'admin' ? 'alumno' : 'admin';
    const pregunta = nuevo === 'admin'
      ? `¿Hacer monitor a ${usuario}? Podrá ver y gestionar todos los cursos y cuentas.`
      : `¿Quitar a ${usuario} el papel de monitor? Pasará a ser alumno.`;
    if (!confirm(pregunta)) return;
    const { error } = await sb.rpc('admin_cambiar_rol', { p_alumno: id, p_rol: nuevo });
    if (error) return mensaje(error.message, true);
    mensaje(nuevo === 'admin' ? `${usuario} ya es monitor` : `${usuario} vuelve a ser alumno`);
    cargarAlumnos();
  }
  if (b.dataset.acc === 'borrar') {
    if (!confirm(`¿Borrar a ${usuario} y todos sus resultados? No se puede deshacer.`)) return;
    const { error } = await sb.rpc('admin_borrar_alumno', { p_alumno: id });
    if (error) return mensaje(error.message, true);
    mensaje(`${usuario} borrado`);
    cargarAlumnos();
  }
});

$('f-alumno').onsubmit = async e => {
  e.preventDefault();
  const curso = $('curso').value;
  const usuario = $('a-usuario').value.trim().toLowerCase();
  const pass = $('a-pass').value;
  const { error } = await sb.rpc('admin_crear_alumno', {
    p_usuario: usuario, p_password: pass, p_apodo: $('a-apodo').value.trim(),
    p_curso: curso === SIN_CURSO ? null : curso,
  });
  if (error) return mensaje(error.message, true);
  añadirTarjeta(usuario, pass);
  mensaje(`Alumno ${usuario} creado`);
  $('a-usuario').value = ''; $('a-apodo').value = ''; $('a-pass').value = generar();
  $('a-usuario').focus();
  cargarAlumnos();
};

function añadirTarjeta(usuario, pass) {
  $('imprimible').classList.remove('oculto');
  $('tarjetas').insertAdjacentHTML('beforeend', `<div class="tarjeta">
    <div class="muted">Taller de informática</div>
    <div>Usuario · Identifiant: <b>${esc(usuario)}</b></div>
    <div>Contraseña · Mot de passe: <b>${esc(pass)}</b></div>
    <div class="muted" style="font-size:.75rem; word-break:break-all">${esc(URL_APP)}</div>
  </div>`);
}

await cargarCursos();

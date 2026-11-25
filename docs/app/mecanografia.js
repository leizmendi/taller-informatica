import { exigirSesion, guardarIntento, misMejores, fmt } from './comun.js';
import { NIVELES, letrasHasta } from './ejercicios.js';
import { PALABRAS, FRASES, TEXTOS_TEST } from './textos.js';
import { crearTeclado, LEYENDA_DEDOS } from './teclado.js';

const $ = id => document.getElementById(id);
const SUPERADO = 90;          // % de aciertos para dar un nivel por superado
const DURACION_TEST = 60;     // segundos

await exigirSesion();

const teclado = crearTeclado($('teclado'));
$('dedos').innerHTML = LEYENDA_DEDOS;
const captura = $('captura');

let modo = null;      // { tipo: 'nivel', n } | { tipo: 'test' }
let sesion = null;    // estado del ejercicio en curso
let hechos = new Set();

// ---------- Generar textos ----------

const azar = arr => arr[Math.floor(Math.random() * arr.length)];
function mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function grupo(letras, largo) {
  let g = '';
  for (let i = 0; i < largo; i++) g += azar(letras);
  return g;
}

export function textoNivel(n, objetivo = 64) {
  const nivel = NIVELES.find(l => l.n === n);
  if (nivel.frases) return mezclar(FRASES).slice(0, 3).join(' ');

  const letras = letrasHasta(n).filter(c => c !== ' ');
  const nuevas = [...nivel.nuevas];
  const permitidas = new Set(letras);
  const palabras = PALABRAS.filter(p => [...p].every(c => permitidas.has(c)));
  const conNuevas = palabras.filter(p => [...p].some(c => nuevas.includes(c)));

  const trozos = [];
  let largo = 0;
  const pon = t => { trozos.push(t); largo += t.length + 1; };

  if (n === 1) {
    // Solo F y J: repeticiones y alternancias
    const base = ['fff', 'jjj', 'fj', 'jf', 'ffj', 'jjf', 'fjf', 'jfj', 'fjj', 'jff'];
    while (largo < objetivo) pon(azar(base));
  } else if (palabras.length < 6) {
    // Pocas palabras posibles: grupos con las letras nuevas y las de antes
    while (largo < objetivo) {
      pon(Math.random() < 0.5 ? azar(nuevas).repeat(3) : grupo(Math.random() < 0.6 ? nuevas.concat(azar(letras)) : letras, 3));
    }
    if (palabras.length) trozos.splice(2, 0, ...mezclar(palabras).slice(0, 2));
  } else {
    // Empieza calentando las teclas nuevas y luego palabras
    for (const c of nuevas.slice(0, 2)) pon(c.repeat(3));
    const fuente = mezclar(conNuevas.length >= 4 ? [...conNuevas, ...conNuevas, ...palabras] : palabras);
    let i = 0;
    while (largo < objetivo) pon(fuente[i++ % fuente.length]);
  }
  return trozos.join(' ');
}

function textoTest() {
  return mezclar(TEXTOS_TEST).slice(0, 3).join(' ');
}

// ---------- Escritura ----------

function empezar(nuevoModo) {
  modo = nuevoModo;
  const texto = modo.tipo === 'test' ? textoTest() : textoNivel(modo.n);
  sesion = { texto, pos: 0, errores: 0, fallo: false, inicio: null, fin: null, timer: null, falladas: {} };

  const caja = $('texto');
  caja.innerHTML = [...texto].map(c => c === ' ' ? '<span class="esp"> </span>' : `<span>${c.replace('<', '&lt;')}</span>`).join('');
  sesion.spans = [...caja.children];
  $('resultado').classList.add('oculto');
  $('zona').classList.remove('oculto');

  if (modo.tipo === 'test') {
    teclado.usadas([]);
    $('titulo-ej').textContent = 'Test de 1 minuto · Test d’1 minute';
    $('ayuda-ej').textContent = 'El tiempo empieza con la primera tecla. Le temps démarre à la première touche.';
  } else {
    const nivel = NIVELES.find(l => l.n === modo.n);
    teclado.usadas(nivel.frases ? [] : letrasHasta(modo.n));
    $('titulo-ej').textContent = `Nivel ${nivel.n} · ${nivel.titulo}`;
    $('ayuda-ej').textContent = nivel.frases
      ? 'Mayúscula: mantén ⇧ con la otra mano. Acento: pulsa ´ y después la vocal.'
      : nivel.nuevas ? `Teclas nuevas: ${nivel.nuevas.toUpperCase().split('').join(' ')}` : '';
  }
  pintarMarcador();
  pintarPosicion();
  marcarNiveles();
  enfocar();
}

function enfocar() {
  captura.value = '';
  captura.focus({ preventScroll: true });
  $('texto').classList.add('activo');
}

function pintarPosicion() {
  const { spans, pos, fallo } = sesion;
  spans.forEach((s, i) => {
    s.classList.toggle('hecho', i < pos);
    s.classList.toggle('actual', i === pos && !fallo);
    s.classList.toggle('fallo', i === pos && fallo);
  });
  teclado.siguiente(sesion.texto[pos]);
  spans[pos]?.scrollIntoView({ block: 'nearest' });
}

function segundos() {
  if (!sesion.inicio) return 0;
  return ((sesion.fin ?? performance.now()) - sesion.inicio) / 1000;
}

function calcular() {
  const s = Math.max(segundos(), 1);
  const ppm = (sesion.pos / 5) / (s / 60);
  const total = sesion.pos + sesion.errores;
  const acierto = total ? (sesion.pos / total) * 100 : 100;
  return { ppm, acierto, s };
}

function pintarMarcador() {
  const { ppm, acierto } = calcular();
  const quedan = modo.tipo === 'test' ? Math.max(0, DURACION_TEST - segundos()) : null;
  $('marcador').innerHTML = `
    ${quedan != null ? `<span>⏱️ <b>${Math.ceil(quedan)}</b> s</span>` : `<span>⏱️ <b>${fmt(segundos())}</b> s</span>`}
    <span>Velocidad · Vitesse <b>${sesion.inicio ? fmt(ppm) : 0}</b> ppm</span>
    <span>Aciertos · Réussite <b>${fmt(acierto)}</b> %</span>
    <span>Fallos · Erreurs <b>${sesion.errores}</b></span>`;
}

function teclaRecibida(ch) {
  if (!sesion || sesion.fin) return;
  if (ch === '\n' || ch === '\r') return;
  if (!sesion.inicio) {
    sesion.inicio = performance.now();
    sesion.timer = setInterval(() => {
      pintarMarcador();
      if (modo.tipo === 'test' && segundos() >= DURACION_TEST) terminar();
    }, 200);
  }
  const esperado = sesion.texto[sesion.pos];
  teclado.pulsar(ch);
  if (ch === esperado) {
    sesion.pos++;
    sesion.fallo = false;
    if (sesion.pos >= sesion.texto.length) return terminar();
  } else {
    // Un fallo por letra: si se insiste en la misma letra no se suma otra vez
    if (!sesion.fallo) {
      sesion.errores++;
      sesion.falladas[esperado] = (sesion.falladas[esperado] || 0) + 1;
    }
    sesion.fallo = true;
  }
  pintarPosicion();
  pintarMarcador();
}

async function terminar() {
  if (sesion.fin) return;
  sesion.fin = performance.now();
  if (modo.tipo === 'test') sesion.fin = Math.min(sesion.fin, sesion.inicio + DURACION_TEST * 1000);
  clearInterval(sesion.timer);
  teclado.siguiente(null);
  $('texto').classList.remove('activo');
  pintarMarcador();

  const { ppm, acierto, s } = calcular();
  const superado = acierto >= SUPERADO;
  const ejercicio = modo.tipo === 'test' ? 'meca-test' : `meca-${modo.n}`;
  const peores = Object.entries(sesion.falladas).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([c]) => c === ' ' ? 'espacio' : c.toUpperCase());

  const r = $('resultado');
  r.classList.remove('oculto');
  r.innerHTML = `
    <h2>${modo.tipo === 'test' ? '¡Tiempo! · Temps écoulé !' : superado ? '¡Muy bien! · Très bien !' : '¡Casi! · Presque !'}</h2>
    <p class="marcador">
      <span>Velocidad <b>${fmt(ppm)}</b> ppm</span>
      <span>Aciertos <b>${fmt(acierto)}</b> %</span>
      <span>Tiempo <b>${fmt(s, 1)}</b> s</span>
    </p>
    ${modo.tipo === 'nivel' ? `<p>${superado ? '✓ Nivel superado · Niveau réussi' : `Para superar el nivel necesitas un ${SUPERADO} % de aciertos. Il faut ${SUPERADO} % de réussite.`}</p>` : ''}
    ${peores.length ? `<p class="muted">Repasa · Révise : ${peores.join(', ')}</p>` : ''}
    <p class="muted" id="guardado">Guardando… · Enregistrement…</p>
    <div class="fila">
      <button id="btn-repetir">Repetir · Recommencer</button>
      ${modo.tipo === 'nivel' && modo.n < NIVELES.length ? `<button id="btn-siguiente" class="ghost">Nivel ${modo.n + 1} →</button>` : ''}
      ${modo.tipo === 'test' ? '<a class="btn ghost" href="clasificacion.html?ej=meca-test">🏆 Clasificación</a>' : ''}
    </div>`;
  $('btn-repetir').onclick = () => empezar(modo);
  const sig = $('btn-siguiente');
  if (sig) sig.onclick = () => empezar({ tipo: 'nivel', n: modo.n + 1 });
  r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (sesion.pos === 0) { $('guardado').textContent = ''; return; }
  const ok = await guardarIntento({
    ejercicio, valor: Math.round(ppm * 10) / 10, acierto: Math.round(acierto * 10) / 10,
    segundos: Math.round(s * 10) / 10, errores: sesion.errores,
    detalle: { caracteres: sesion.pos, superado, falladas: sesion.falladas },
  });
  $('guardado').textContent = ok ? '✓ Guardado · Enregistré' : 'No se ha podido guardar · Erreur d’enregistrement';
  if (ok && superado && modo.tipo === 'nivel') { hechos.add(modo.n); marcarNiveles(); }
}

// Captura del teclado con un textarea oculto: así funcionan los acentos (tecla muerta).
let componiendo = false;
function vaciar() {
  const v = captura.value;
  captura.value = '';
  for (const ch of v) teclaRecibida(ch);
}
captura.addEventListener('compositionstart', () => { componiendo = true; });
captura.addEventListener('compositionend', () => { componiendo = false; vaciar(); });
captura.addEventListener('input', () => { if (!componiendo) vaciar(); });
captura.addEventListener('blur', () => $('texto').classList.remove('activo'));
captura.addEventListener('keydown', e => { if (e.key === 'Tab') e.preventDefault(); });
$('texto').addEventListener('click', enfocar);
document.addEventListener('keydown', e => {
  if (document.activeElement !== captura && sesion && !sesion.fin && e.key.length === 1 && !e.ctrlKey && !e.metaKey) enfocar();
});

// ---------- Selector de niveles ----------

function marcarNiveles() {
  for (const b of $('niveles').children) {
    const n = Number(b.dataset.n);
    b.classList.toggle('hecho', hechos.has(n));
    b.classList.toggle('actual', modo?.tipo === 'nivel' ? modo.n === n : b.dataset.test != null && modo?.tipo === 'test');
  }
}

$('niveles').innerHTML = NIVELES.map(l => `<button class="ghost" data-n="${l.n}" title="${l.titulo}">${l.n}</button>`).join('')
  + '<button data-test>Test 1 min</button>';
$('niveles').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (sesion && !sesion.fin) clearInterval(sesion.timer);
  empezar(b.dataset.test != null ? { tipo: 'test' } : { tipo: 'nivel', n: Number(b.dataset.n) });
};
$('ver-teclado').onchange = e => $('bloque-teclado').classList.toggle('oculto', !e.target.checked);

for (const i of await misMejores()) {
  const m = /^meca-(\d+)$/.exec(i.ejercicio);
  if (m && i.acierto >= SUPERADO) hechos.add(Number(m[1]));
}
const primero = NIVELES.find(l => !hechos.has(l.n))?.n;
empezar(primero ? { tipo: 'nivel', n: primero } : { tipo: 'test' });

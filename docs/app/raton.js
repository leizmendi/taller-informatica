import { exigirSesion, guardarIntento, misMejores, calcularRecords, mejora, mensajeRecord, fmt } from './comun.js';
import { EJERCICIOS, formatoValor } from './ejercicios.js';

const $ = id => document.getElementById(id);
await exigirSesion();
const records = calcularRecords(await misMejores());
const textoRecord = () => records[modo] != null
  ? `<span>🏆 Récord <b>${formatoValor(EJERCICIOS[modo], records[modo])}</b></span>` : '';

const MODOS = {
  'raton-clic':      { rondas: 10, clase: '',    ayuda: 'Haz clic en cada diana lo más rápido que puedas. · Clique sur chaque cible.' },
  'raton-doble':     { rondas: 10, clase: 'dos', ayuda: 'Doble clic en cada diana azul. · Double-clic sur chaque cible bleue.' },
  'raton-derecho':   { rondas: 10, clase: 'der', ayuda: 'Clic con el botón DERECHO en cada diana verde. · Clic droit sur chaque cible verte.' },
  'raton-arrastrar': { rondas: 5,  ayuda: 'Arrastra la bola naranja hasta la caja. · Glisse la balle dans la boîte.' },
};

const arena = $('arena');
let modo = 'raton-clic';
let juego = null;

function pintarModos() {
  $('modos').innerHTML = Object.keys(MODOS).map(id =>
    `<button data-id="${id}" class="${id === modo ? 'elegido' : 'ghost'}">${EJERCICIOS[id].titulo} · <span class="fr">${EJERCICIOS[id].fr}</span></button>`).join('');
}
$('modos').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  modo = b.dataset.id; preparar();
};

function preparar() {
  juego = null;
  pintarModos();
  $('ayuda').textContent = MODOS[modo].ayuda;
  $('marcador').innerHTML = textoRecord();
  arena.innerHTML = `<div class="centro"><div style="display:grid; gap:12px; justify-items:center">
      <p style="font-size:1.2rem">${MODOS[modo].ayuda}</p>
      <button id="btn-empezar" style="font-size:1.3rem; padding:12px 28px">▶ Empezar · Commencer</button>
    </div></div>`;
  $('btn-empezar').onclick = empezar;
}

function posAzar(tam) {
  const w = arena.clientWidth, h = arena.clientHeight, m = 10;
  return { x: m + Math.random() * (w - tam - 2 * m), y: m + Math.random() * (h - tam - 2 * m) };
}

function empezar() {
  juego = { ronda: 0, fallos: 0, inicio: performance.now(), timer: setInterval(marcador, 100) };
  arena.innerHTML = '';
  siguiente();
}

function marcador() {
  if (!juego) return;
  const s = (performance.now() - juego.inicio) / 1000;
  $('marcador').innerHTML = `<span>⏱️ <b>${fmt(s, 1)}</b> s</span>
    <span>Ronda · Manche <b>${juego.ronda}/${MODOS[modo].rondas}</b></span>
    <span>Fallos · Ratés <b>${juego.fallos}</b></span>
    ${textoRecord()}`;
}

function acierto() {
  juego.ronda++;
  marcador();
  if (juego.ronda >= MODOS[modo].rondas) terminar(); else siguiente();
}

function siguiente() {
  arena.innerHTML = '';
  if (modo === 'raton-arrastrar') return siguienteArrastrar();
  const d = document.createElement('div');
  d.className = `diana ${MODOS[modo].clase}`;
  const p = posAzar(64);
  d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
  const evento = { 'raton-clic': 'click', 'raton-doble': 'dblclick', 'raton-derecho': 'contextmenu' }[modo];
  d.addEventListener(evento, e => { e.preventDefault(); e.stopPropagation(); acierto(); });
  // Un clic normal en una diana de doble clic no es fallo (es la mitad del doble clic)
  d.addEventListener('click', e => { e.stopPropagation(); if (modo === 'raton-derecho') { juego.fallos++; marcador(); } });
  d.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); if (modo !== 'raton-derecho') juego.fallos++; });
  arena.appendChild(d);
}

// Fallo: clic fuera de la diana
arena.addEventListener('mousedown', e => {
  if (juego && e.target === arena && modo !== 'raton-arrastrar') { juego.fallos++; marcador(); }
});
arena.addEventListener('contextmenu', e => e.preventDefault());

function siguienteArrastrar() {
  const caja = document.createElement('div'); caja.className = 'caja';
  const bola = document.createElement('div'); bola.className = 'bola';
  let pc, pb;
  do { pc = posAzar(110); pb = posAzar(56); } while (Math.hypot(pc.x - pb.x, pc.y - pb.y) < 220);
  Object.assign(caja.style, { left: pc.x + 'px', top: pc.y + 'px' });
  Object.assign(bola.style, { left: pb.x + 'px', top: pb.y + 'px' });
  arena.append(caja, bola);

  let dx, dy;
  bola.addEventListener('pointerdown', e => {
    e.preventDefault();
    bola.setPointerCapture(e.pointerId);
    bola.classList.add('cogida');
    dx = e.clientX - bola.offsetLeft; dy = e.clientY - bola.offsetTop;
  });
  bola.addEventListener('pointermove', e => {
    if (!bola.hasPointerCapture(e.pointerId)) return;
    bola.style.left = (e.clientX - dx) + 'px';
    bola.style.top = (e.clientY - dy) + 'px';
  });
  bola.addEventListener('pointerup', e => {
    bola.classList.remove('cogida');
    const cx = bola.offsetLeft + 28, cy = bola.offsetTop + 28;
    const dentro = cx > caja.offsetLeft && cx < caja.offsetLeft + 110 && cy > caja.offsetTop && cy < caja.offsetTop + 110;
    if (dentro) acierto(); else { juego.fallos++; marcador(); }
  });
}

async function terminar() {
  clearInterval(juego.timer);
  const s = (performance.now() - juego.inicio) / 1000;
  const fallos = juego.fallos;
  juego = null;
  arena.innerHTML = `<div class="centro"><div style="display:grid; gap:12px; justify-items:center">
      <h2>¡Hecho! · Fini !</h2>
      <p class="marcador"><span>Tiempo <b>${fmt(s, 1)}</b> s</span><span>Fallos <b>${fallos}</b></span></p>
      <p id="record"></p>
      <p class="muted" id="guardado">Guardando…</p>
      <div class="fila">
        <button id="btn-otra">Otra vez · Encore</button>
        <a class="btn ghost" href="clasificacion.html?ej=${modo}">🏆 Clasificación</a>
      </div></div></div>`;
  $('btn-otra').onclick = empezar;
  const ejercicio = modo, valor = Math.round(s * 10) / 10;
  const ok = await guardarIntento({
    ejercicio, valor, segundos: Math.round(s * 10) / 10, errores: fallos,
    acierto: Math.round(MODOS[modo].rondas / (MODOS[modo].rondas + fallos) * 1000) / 10,
  });
  if (!ok) { if ($('guardado')) $('guardado').textContent = 'No se ha podido guardar'; return; }
  const ej = EJERCICIOS[ejercicio], previo = records[ejercicio];
  // Si ya ha pulsado "Otra vez", la pantalla de resultado ya no está
  if ($('record')) {
    $('guardado').textContent = '✓ Guardado · Enregistré';
    $('record').innerHTML = mensajeRecord(ej, valor, previo);
  }
  if (mejora(ej, valor, previo)) { records[ejercicio] = valor; marcador(); }
}

preparar();

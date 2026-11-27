// Prueba 3: "Ordena los archivos" (la de fichas/carpetas.html) con reloj y récord.
// Se arrastra cada archivo a su carpeta según la extensión.
// Textos: claves m3.* y comun.* de idiomas/*.js
import { guardarIntento, mejora, mensajeRecord, sonar, celebrar, fmt } from './comun.js';
import { EJERCICIOS, formatoValor } from './ejercicios.js';
import { t, t1 } from './i18n.js';

const EJ = 'arch-ordena';
const ARCHIVOS = [
  { n: 'moussa.txt', i: '📄', f: 'Textos' },
  { n: 'playa.jpg', i: '🖼️', f: 'Fotos' },
  { n: 'index.html', i: '🌐', f: 'Web' },
  { n: 'cv.docx', i: '📝', f: 'Textos' },
  { n: 'amigos.png', i: '🖼️', f: 'Fotos' },
  { n: 'estilo.css', i: '🎨', f: 'Web' },
  { n: 'martes.txt', i: '📄', f: 'Textos' },
  { n: 'futbol.jpg', i: '🖼️', f: 'Fotos' },
  { n: 'mi-web.html', i: '🌐', f: 'Web' },
];
const CARPETAS = ['Textos', 'Fotos', 'Web'];
const ICONO_CARPETA = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><path d="M5 13h14l4 5h20v22H5z"/></svg>';

const barajar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function montar({ records, caja, marcadorEl }) {
  const q = sel => caja.querySelector(sel);
  let vivo = true;
  let juego = null; // { orden, idx, inicio, timer, errores }
  let timerPista;

  const textoRecord = () => records[EJ] != null
    ? `<span>🏆 ${t1('record.record')} <b>${formatoValor(EJERCICIOS[EJ], records[EJ])}</b></span>` : '';

  function marcador() {
    if (!juego) { marcadorEl.innerHTML = textoRecord(); return; }
    const s = (performance.now() - juego.inicio) / 1000;
    marcadorEl.innerHTML = `<span>⏱️ <b>${fmt(s, 1)}</b> s</span>
      <span>${t('m3.archivo')} <b>${juego.idx}/${ARCHIVOS.length}</b></span>
      <span>${t('comun.fallos')} <b>${juego.errores}</b></span>
      ${textoRecord()}`;
  }

  caja.innerHTML = `<h2>${t('m3.titulo')}</h2>
    <p>${t('m3.intro')}</p>
    <div class="leyenda"><span><b>.txt .docx</b> = Textos</span><span><b>.jpg .png</b> = Fotos</span><span><b>.html .css</b> = Web</span></div>
    <div class="arena ordena" id="escena"></div>`;
  const escena = q('#escena');

  function inicio() {
    juego = null;
    marcador();
    escena.innerHTML = `<div class="centro"><button id="btn-empezar" class="grande">▶ ${t('comun.empezar')}</button></div>`;
    q('#btn-empezar').onclick = empezar;
  }

  function empezar() {
    juego = { orden: barajar(ARCHIVOS), idx: 0, inicio: performance.now(), timer: setInterval(marcador, 100), errores: 0 };
    ronda();
  }

  function pista(html) {
    escena.querySelector('.pista-flotante')?.remove();
    const h = document.createElement('div');
    h.className = 'pista-flotante';
    h.innerHTML = html;
    escena.appendChild(h);
    clearTimeout(timerPista);
    timerPista = setTimeout(() => h.remove(), 2500);
  }

  function ronda() {
    marcador();
    escena.innerHTML = '';
    if (juego.idx >= juego.orden.length) return terminar();
    const fila = document.createElement('div');
    fila.className = 'carpetas';
    const zonas = CARPETAS.map(nombre => {
      const z = document.createElement('div');
      z.className = 'carpeta';
      z.dataset.nombre = nombre;
      z.innerHTML = ICONO_CARPETA + `<strong>${nombre}</strong>`;
      fila.appendChild(z);
      return z;
    });
    escena.appendChild(fila);

    const dato = juego.orden[juego.idx];
    const el = document.createElement('div');
    el.className = 'archivo';
    el.innerHTML = `<span class="ico">${dato.i}</span><span class="nm">${dato.n}</span>`;
    escena.appendChild(el);
    const casa = { x: Math.max(16, escena.clientWidth / 2 - 70), y: 40 };
    el.style.left = casa.x + 'px'; el.style.top = casa.y + 'px';

    const zonaDebajo = () => {
      const a = el.getBoundingClientRect(), cx = a.left + a.width / 2, cy = a.top + a.height / 2;
      return zonas.find(z => { const b = z.getBoundingClientRect(); return cx > b.left && cx < b.right && cy > b.top && cy < b.bottom; }) || null;
    };
    let dx = 0, dy = 0;
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('cogido');
      dx = e.clientX - el.offsetLeft; dy = e.clientY - el.offsetTop;
    });
    el.addEventListener('pointermove', e => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      el.style.left = (e.clientX - dx) + 'px'; el.style.top = (e.clientY - dy) + 'px';
      const z = zonaDebajo();
      zonas.forEach(x => x.classList.toggle('encima', x === z));
    });
    el.addEventListener('pointerup', () => {
      el.classList.remove('cogido');
      const z = zonaDebajo();
      zonas.forEach(x => x.classList.remove('encima'));
      if (!z || !juego) return; // soltado fuera: no cuenta
      if (z.dataset.nombre === dato.f) {
        el.remove();
        juego.idx++;
        setTimeout(() => { if (vivo && juego) ronda(); }, 200);
      } else {
        juego.errores++;
        marcador();
        z.classList.add('mal'); setTimeout(() => z.classList.remove('mal'), 600);
        pista(t(`m3.pista.${dato.f}`));
        el.style.left = casa.x + 'px'; el.style.top = casa.y + 'px';
      }
    });
  }

  async function terminar() {
    clearInterval(juego.timer);
    const s = (performance.now() - juego.inicio) / 1000;
    const errores = juego.errores;
    juego = null;
    marcador();
    escena.innerHTML = `<div class="centro"><div style="display:grid; gap:12px; justify-items:center">
        <h2>${t('m3.hecho')}</h2>
        <p class="marcador"><span>${t1('comun.tiempo')} <b>${fmt(s, 1)}</b> s</span><span>${t1('comun.fallos')} <b>${errores}</b></span></p>
        <p id="record"></p>
        <p class="muted" id="guardado">${t('comun.guardando')}</p>
        <div class="fila">
          <button id="btn-otra">${t('comun.otraVez')}</button>
          <a class="btn ghost" href="clasificacion.html?ej=${EJ}">🏆 ${t1('clasif.titulo')}</a>
        </div></div></div>`;
    q('#btn-otra').onclick = empezar;
    const ej = EJERCICIOS[EJ], valor = Math.round(s * 10) / 10, previo = records[EJ];
    if (previo != null && mejora(ej, valor, previo)) { sonar('record'); celebrar(); } else sonar('ok');
    const ok = await guardarIntento({
      ejercicio: EJ, valor, segundos: valor, errores,
      acierto: Math.round(ARCHIVOS.length / (ARCHIVOS.length + errores) * 1000) / 10,
    });
    if (!vivo || !q('#guardado')) return;
    if (!ok) { q('#guardado').innerHTML = t('comun.noGuardado'); return; }
    q('#guardado').innerHTML = '✓ ' + t('comun.guardado');
    q('#record').innerHTML = mensajeRecord(ej, valor, previo);
    if (mejora(ej, valor, previo)) { records[EJ] = valor; marcador(); }
  }

  inicio();
  return () => { vivo = false; clearTimeout(timerPista); if (juego) clearInterval(juego.timer); juego = null; };
}

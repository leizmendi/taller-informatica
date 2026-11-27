// Misión 1: crear "Taller - apodo" en Documentos con Textos, Fotos y Web. Cronometrada.
// Se hace en el Explorador de Windows; la app cronometra y comprueba la carpeta.
// Textos: claves m1.*, arch.* y comun.* de idiomas/*.js
import { guardarIntento, mejora, mensajeRecord, sonar, celebrar, esc, fmt } from './comun.js';
import { EJERCICIOS, formatoValor } from './ejercicios.js';
import { t, t1 } from './i18n.js';
import { SUBCARPETAS, nombreCarpeta, norm, puedeLeerCarpetas, avisoNavegador, contenido, hayArchivos, olvidarCarpeta, leerMiCarpeta } from './archivos-comun.js';

const EJ = 'arch-carpeta';

export function montar({ perfil, records, caja, marcadorEl }) {
  const NOMBRE = nombreCarpeta(perfil);
  const carpeta = `<span class="nombre">${esc(NOMBRE)}</span>`;
  const TITULO = `<h2>${t('m1.titulo')}</h2>`;
  const q = sel => caja.querySelector(sel);
  let vivo = true;          // false cuando se cambia a otra misión
  let juego = null;         // { inicio, timer, errores }
  let ultimaCarpeta = null; // carpeta con la que se superó la misión (para repetir)

  const textoRecord = () => records[EJ] != null
    ? `<span>🏆 ${t1('record.record')} <b>${formatoValor(EJERCICIOS[EJ], records[EJ])}</b></span>` : '';

  function marcador() {
    if (!juego) { marcadorEl.innerHTML = textoRecord(); return; }
    const s = (performance.now() - juego.inicio) / 1000;
    marcadorEl.innerHTML = `<span>⏱️ <b>${fmt(s, 0)}</b> s</span>
      <span>${t('comun.intentosFallidos')} <b>${juego.errores}</b></span>
      ${textoRecord()}`;
  }

  const arbol = `<p class="arbol">📂 ${t('arch.documentos')}<br>
    &nbsp;&nbsp;└ 📁 <b>${esc(NOMBRE)}</b><br>
    ${SUBCARPETAS.map((c, i) => `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${i < SUBCARPETAS.length - 1 ? '├' : '└'} 📁 ${c}`).join('<br>')}</p>`;

  const pasos = `<ol class="pasos">
    <li>${t('m1.paso1')}</li>
    <li>${t('m1.paso2')} <span class="muted">${t1('m1.pad')}</span></li>
    <li>${t('m1.paso3', { carpeta })}</li>
    <li>${t('m1.paso4')}</li>
    <li>${t('m1.paso5', { carpeta })}</li>
  </ol>`;

  function inicio() {
    juego = null;
    marcador();
    if (!puedeLeerCarpetas()) { caja.innerHTML = TITULO + avisoNavegador(); return; }
    caja.innerHTML = `${TITULO}
      <p>${t('m1.intro')}</p>
      ${arbol}
      <div><button id="btn-empezar" class="grande">▶ ${t('comun.empezar')}</button></div>`;
    q('#btn-empezar').onclick = empezar;
  }

  function empezar() {
    olvidarCarpeta();
    juego = { inicio: performance.now(), timer: setInterval(marcador, 500), errores: 0 };
    marcador();
    caja.innerHTML = `${TITULO}
      ${pasos}
      ${arbol}
      <div class="fila"><button id="btn-comprobar" class="grande">🔍 ${t('comun.comprobar')}</button></div>
      <div id="revision"></div>`;
    q('#btn-comprobar').onclick = comprobar;
  }

  const mostrar = html => { if (vivo && q('#revision')) q('#revision').innerHTML = html; };

  function fallo(html) {
    juego.errores++;
    marcador();
    sonar('fallo');
    mostrar(html);
  }

  async function comprobar() {
    if (!juego) return;
    const r = await leerMiCarpeta(perfil);
    if (!r || !juego) return; // ha cerrado la ventana sin elegir: no cuenta como fallo
    if (r.error) return r.sinFallo ? mostrar(r.error) : fallo(r.error);
    const { raiz, dentro } = r;

    // Revisión de las subcarpetas
    const carpetas = dentro.filter(h => h.kind === 'directory');
    const lineas = [];
    let todoBien = true;
    for (const c of SUBCARPETAS) {
      if (carpetas.some(h => norm(h.name) === norm(c))) { lineas.push(`<li class="bien">${c}</li>`); continue; }
      todoBien = false;
      // ¿La ha creado dentro de otra subcarpeta?
      let donde = null;
      for (const h of carpetas) {
        try { if ((await contenido(h)).some(n => n.kind === 'directory' && norm(n.name) === norm(c))) donde = h.name; } catch { }
      }
      if (donde) lineas.push(`<li>${t('m1.dentroDe', { c, donde: esc(donde), raiz: esc(raiz.name) })}</li>`);
      else if (dentro.some(h => h.kind === 'file' && norm(h.name).startsWith(norm(c))))
        lineas.push(`<li>${t('m1.esArchivo', { c })}</li>`);
      else lineas.push(`<li>${t('m1.falta', { c })}</li>`);
    }
    for (const h of carpetas) {
      if (/^nueva carpeta/i.test(h.name)) {
        todoBien = false;
        lineas.push(`<li>${t('m1.nuevaCarpeta', { nombre: esc(h.name) })}</li>`);
      }
    }

    if (!todoBien) {
      return fallo(`<p>${t('m1.noLista', { nombre: esc(raiz.name) })}</p>
        <ul class="revision">${lineas.join('')}</ul>
        <p class="muted">${t('comun.arreglalo')}</p>`);
    }
    ultimaCarpeta = raiz;
    terminar(lineas);
  }

  async function terminar(lineas) {
    clearInterval(juego.timer);
    const s = (performance.now() - juego.inicio) / 1000;
    const errores = juego.errores;
    juego = null;
    marcador();
    caja.innerHTML = `<h2>${t('comun.cumplida')}</h2>
      <ul class="revision">${lineas.join('')}</ul>
      <p class="marcador"><span>${t1('comun.tiempo')} <b>${fmt(s, 1)}</b> s</span><span>${t1('comun.intentosFallidos')} <b>${errores}</b></span></p>
      <p id="record"></p>
      <p class="muted" id="guardado">${t('comun.guardando')}</p>
      <div class="fila">
        <button id="btn-otra">${t('comun.otraVez')}</button>
        <a class="btn ghost" href="clasificacion.html?ej=${EJ}">🏆 ${t1('clasif.titulo')}</a>
      </div>
      <div id="revision"></div>`;
    q('#btn-otra').onclick = otraVez;

    const ej = EJERCICIOS[EJ], valor = Math.round(s * 10) / 10, previo = records[EJ];
    if (previo != null && mejora(ej, valor, previo)) { sonar('record'); celebrar(); } else sonar('ok');
    const ok = await guardarIntento({
      ejercicio: EJ, valor, segundos: valor, errores,
      acierto: Math.round(1000 / (1 + errores)) / 10,
    });
    if (!vivo || !q('#guardado')) return;
    if (!ok) { q('#guardado').innerHTML = t('comun.noGuardado'); return; }
    q('#guardado').innerHTML = '✓ ' + t('comun.guardado');
    q('#record').innerHTML = mensajeRecord(ej, valor, previo);
    if (mejora(ej, valor, previo)) { records[EJ] = valor; marcador(); }
  }

  // Para repetir hay que borrar antes la carpeta, si no la misión ya estaría hecha.
  // Pero nunca se pide borrarla si ya tiene archivos suyos dentro.
  async function otraVez() {
    if (!ultimaCarpeta) return empezar();
    try {
      if (await hayArchivos(ultimaCarpeta)) return mostrar(`<p>${t('m1.noBorres')}</p>`);
    } catch (e) {
      ultimaCarpeta = null; // NotFoundError: ya la ha borrado
      return empezar();
    }
    mostrar(`<p>${t('m1.borraAntes')}</p>`);
  }

  inicio();
  return () => { vivo = false; if (juego) clearInterval(juego.timer); juego = null; };
}

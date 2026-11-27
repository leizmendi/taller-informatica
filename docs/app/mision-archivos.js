// Misión 2: crear un texto con el Bloc de notas y un dibujo con Paint, ver con qué
// programa se abre cada uno y ordenarlos en Textos y Fotos. Sin reloj: lo que cuenta
// es fijarse. Al final la app comprueba la carpeta y enseña el texto y el dibujo.
// Textos: claves m2.*, prog.*, arch.* y comun.* de idiomas/*.js
import { guardarIntento, sonar, celebrar, esc } from './comun.js';
import { t, t1 } from './i18n.js';
import { SUBCARPETAS, nombreCarpeta, norm, puedeLeerCarpetas, avisoNavegador, contenido, leerMiCarpeta } from './archivos-comun.js';

const EJ = 'arch-archivos';

const ARCHIVOS = [
  { base: 'yo', exts: ['txt'], carpeta: 'Textos', nombre: 'yo.txt', tipo: 'm2.tipoTexto', dondeSuele: 'arch.documentos' },
  { base: 'dibujo', exts: ['png', 'jpg', 'jpeg', 'bmp', 'gif'], carpeta: 'Fotos', nombre: 'dibujo.png', tipo: 'm2.tipoImagen', dondeSuele: 'arch.imagenes' },
];

// "Dibujo.PNG" → { base: "dibujo", ext: "png" }
function partes(nombre) {
  const i = nombre.lastIndexOf('.');
  return i > 0 ? { base: norm(nombre.slice(0, i)), ext: nombre.slice(i + 1).toLowerCase() } : { base: norm(nombre), ext: '' };
}

export function montar({ perfil, records, caja, marcadorEl }) {
  const NOMBRE = nombreCarpeta(perfil);
  const carpeta = esc(NOMBRE);
  const TITULO = `<h2>${t('m2.titulo')}</h2>`;
  const q = sel => caja.querySelector(sel);
  let vivo = true;
  const respondidas = new Set();
  let fallosPreguntas = 0;
  const urls = [];

  const PROGRAMAS = [['bloc', '📝 ' + t('prog.bloc')], ['paint', '🎨 Paint'], ['fotos', '🖼️ ' + t('prog.fotos')], ['nav', '🌐 ' + t('prog.navegador')]];
  const PREGUNTAS = [
    { id: 'p1', texto: t('m2.p1'), opciones: PROGRAMAS, bien: ['bloc'], pista: t('m2.pistaVentana') },
    { id: 'p2', texto: t('m2.p2'), opciones: PROGRAMAS, bien: ['fotos', 'paint'], pista: t('m2.pistaVentana') },
    { id: 'p3', texto: t('m2.p3'),
      opciones: [['nombre', t('m2.p3nombre')], ['ext', t('m2.p3ext')], ['carpeta', t('m2.p3carpeta')]],
      bien: ['ext'], pista: t('m2.p3pista') },
  ];

  const hecha = `<span>✅ ${t('comun.yaHecha')}</span>`;
  marcadorEl.innerHTML = records[EJ] != null ? hecha : '';
  if (!puedeLeerCarpetas()) { caja.innerHTML = TITULO + avisoNavegador(); return () => {}; }

  const casilla = html => `<li><label><input type="checkbox"> ${html}</label></li>`;
  const cajaPregunta = p => `<div class="pregunta" data-id="${p.id}">
      <p>${p.texto}</p>
      <div class="opciones">${p.opciones.map(([v, x]) => `<button class="ghost" data-v="${v}">${x}</button>`).join('')}</div>
      <p class="pista"></p>
    </div>`;

  caja.innerHTML = `${TITULO}
    <p>${t('m2.intro')}</p>

    <h3>1 · ${t('m2.h1')}</h3>
    <ul class="checklist">
      ${casilla(t('m2.bloc1'))}
      ${casilla(t('m2.bloc2'))}
      ${casilla(t('m2.bloc3', { carpeta }))}
      ${casilla(t('m2.bloc4'))}
    </ul>

    <h3>2 · ${t('m2.h2')}</h3>
    <ul class="checklist">
      ${casilla(t('m2.paint1'))}
      ${casilla(`${t('m2.paint2')} <span class="muted">${t1('m2.pad')}</span>`)}
      ${casilla(t('m2.paint3', { carpeta }))}
      ${casilla(t('m2.paint4'))}
    </ul>

    <h3>3 · ${t('m2.h3')}</h3>
    <p>${t('m2.dobleClic', { carpeta })}</p>
    ${PREGUNTAS.map(cajaPregunta).join('')}

    <h3>4 · ${t('m2.h4')}</h3>
    <ul class="checklist">
      ${casilla(t('m2.ordena1'))}
      ${casilla(t('m2.ordena2'))}
    </ul>

    <h3>5 · ${t('comun.comprobar')}</h3>
    <p>${t('arch.comoComprobar', { carpeta: `<span class="nombre">${carpeta}</span>` })}</p>
    <div class="fila"><button id="btn-comprobar" class="grande">🔍 ${t('comun.comprobar')}</button></div>
    <div id="revision"></div>`;

  for (const div of caja.querySelectorAll('.pregunta')) {
    const p = PREGUNTAS.find(x => x.id === div.dataset.id);
    div.querySelector('.opciones').onclick = e => {
      const b = e.target.closest('button'); if (!b || respondidas.has(p.id)) return;
      if (p.bien.includes(b.dataset.v)) {
        respondidas.add(p.id);
        b.classList.remove('ghost'); b.classList.add('acierto');
        div.querySelectorAll('button').forEach(x => { x.disabled = x !== b; });
        div.querySelector('.pista').innerHTML = '✅ ' + t(p.id === 'p3' ? 'm2.p3bien' : 'comun.bien');
        sonar('ok');
      } else {
        fallosPreguntas++;
        b.disabled = true;
        div.querySelector('.pista').innerHTML = '🤔 ' + p.pista;
        sonar('fallo');
      }
    };
  }

  const mostrar = html => { if (vivo && q('#revision')) q('#revision').innerHTML = html; };
  q('#btn-comprobar').onclick = comprobar;

  async function comprobar() {
    const r = await leerMiCarpeta(perfil);
    if (!r || !vivo) return;
    if (r.error) { sonar('fallo'); return mostrar(r.error); }
    const { dentro } = r;

    // Archivos sueltos en su carpeta y en cada subcarpeta (un nivel)
    const entradas = dentro.filter(h => h.kind === 'file').map(h => ({ h, donde: '' }));
    const faltanCarpetas = [];
    for (const c of SUBCARPETAS) {
      const sub = dentro.find(h => h.kind === 'directory' && norm(h.name) === norm(c));
      if (!sub) { faltanCarpetas.push(c); continue; }
      try { for (const h of await contenido(sub)) if (h.kind === 'file') entradas.push({ h, donde: c }); } catch { }
    }
    if (!vivo) return;
    const lineas = [];
    let todoBien = true;
    const encontrados = [];

    if (faltanCarpetas.length) {
      todoBien = false;
      lineas.push(`<li>${t('m2.faltanCarpetas', { lista: faltanCarpetas.join(', ') })}</li>`);
    }

    for (const a of ARCHIVOS) {
      const iguales = entradas.filter(e => { const p = partes(e.h.name); return p.base === a.base && a.exts.includes(p.ext); });
      if (iguales.length === 1 && iguales[0].donde === a.carpeta) {
        lineas.push(`<li class="bien">${t1('m2.estaEn', { nombre: esc(iguales[0].h.name), c: a.carpeta })}</li>`);
        encontrados.push({ a, h: iguales[0].h });
        continue;
      }
      todoBien = false;
      if (iguales.length > 1) {
        const sitios = iguales.map(e => e.donde || carpeta).join(' / ');
        lineas.push(`<li>${t('m2.dosSitios', { nombre: a.nombre, sitios, c: a.carpeta })}</li>`);
      } else if (iguales.length === 1 && !iguales[0].donde) {
        lineas.push(`<li>${t('m2.suelto', { nombre: esc(iguales[0].h.name), c: a.carpeta })}</li>`);
      } else if (iguales.length === 1) {
        lineas.push(`<li>${t('m2.malSitio', { nombre: esc(iguales[0].h.name), donde: iguales[0].donde, tipo: t1(a.tipo), c: a.carpeta })}</li>`);
      } else {
        // No está: ¿tiene otro nombre?
        const parecido = entradas.find(e => {
          const p = partes(e.h.name);
          return (p.base.startsWith(a.base) || p.base.startsWith('sintitulo')) && (a.exts.includes(p.ext) || p.base.startsWith(a.base));
        });
        if (parecido && partes(parecido.h.name).base.startsWith('sintitulo')) {
          lineas.push(`<li>${t('m2.sinTitulo', { nombre: esc(parecido.h.name), base: a.base })}</li>`);
        } else if (parecido) {
          lineas.push(`<li>${t('m2.otroNombre', { nombre: esc(parecido.h.name), bueno: a.nombre })}</li>`);
        } else {
          lineas.push(`<li>${t('m2.noEsta', { nombre: a.nombre, donde: t1(a.dondeSuele) })}</li>`);
        }
      }
    }

    if (!todoBien) {
      sonar('fallo');
      return mostrar(`<p>${t('comun.aunNo')}</p><ul class="revision">${lineas.join('')}</ul>
        <p class="muted">${t('comun.arreglalo')}</p>`);
    }
    if (respondidas.size < PREGUNTAS.length) {
      sonar('fallo');
      return mostrar(`<ul class="revision">${lineas.join('')}</ul>
        <p>${t('m2.faltanPreguntas')}</p>`);
    }
    terminar(lineas, encontrados);
  }

  async function terminar(lineas, encontrados) {
    // El premio: su texto y su dibujo, leídos de su carpeta
    let texto = '', imagen = '';
    for (const { a, h } of encontrados) {
      try {
        const f = await h.getFile();
        if (a.base === 'yo') texto = (await f.text()).slice(0, 2000);
        else { const u = URL.createObjectURL(f); urls.push(u); imagen = u; }
      } catch { }
    }
    if (!vivo) return;
    sonar('ok'); celebrar();
    caja.innerHTML = `<h2>${t('comun.cumplida')}</h2>
      <ul class="revision">${lineas.join('')}</ul>
      <div class="premio">
        ${texto ? `<figure><figcaption>📝 ${t('m2.tuTexto')}</figcaption><pre>${esc(texto)}</pre></figure>` : ''}
        ${imagen ? `<figure><figcaption>🎨 ${t('m2.tuDibujo')}</figcaption><img src="${imagen}" alt=""></figure>` : ''}
      </div>
      <p class="muted" id="guardado">${t('comun.guardando')}</p>`;
    const ok = await guardarIntento({
      ejercicio: EJ, valor: 1, errores: fallosPreguntas,
      acierto: Math.round(PREGUNTAS.length / (PREGUNTAS.length + fallosPreguntas) * 1000) / 10,
    });
    if (!vivo || !q('#guardado')) return;
    q('#guardado').innerHTML = ok ? '✓ ' + t('comun.guardado') : t('comun.noGuardado');
    if (ok) { records[EJ] = 1; marcadorEl.innerHTML = hecha; }
  }

  return () => { vivo = false; urls.forEach(u => URL.revokeObjectURL(u)); };
}

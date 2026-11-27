// Misión 2: crear un texto con el Bloc de notas y un dibujo con Paint, ver con qué
// programa se abre cada uno y ordenarlos en Textos y Fotos. Sin reloj: lo que cuenta
// es fijarse. Al final la app comprueba la carpeta y enseña el texto y el dibujo.
import { guardarIntento, sonar, celebrar, esc } from './comun.js';
import { SUBCARPETAS, nombreCarpeta, norm, puedeLeerCarpetas, avisoNavegador, contenido, leerMiCarpeta } from './archivos-comun.js';

const EJ = 'arch-archivos';
const TITULO = '<h2>Misión 2: mis archivos · Mes fichiers</h2>';

const ARCHIVOS = [
  { base: 'yo', exts: ['txt'], carpeta: 'Textos', nombre: 'yo.txt', tipo: 'texto · texte', dondeSuele: 'Documentos' },
  { base: 'dibujo', exts: ['png', 'jpg', 'jpeg', 'bmp', 'gif'], carpeta: 'Fotos', nombre: 'dibujo.png', tipo: 'imagen · image', dondeSuele: 'Imágenes' },
];

const PROGRAMAS = [
  ['bloc', '📝 Bloc de notas · Bloc-notes'],
  ['paint', '🎨 Paint'],
  ['fotos', '🖼️ Fotos · Photos'],
  ['nav', '🌐 Navegador · Navigateur'],
];
const PREGUNTAS = [
  { id: 'p1', texto: 'Doble clic en <b>yo.txt</b>. ¿Con qué programa se ha abierto? · Avec quel programme s’ouvre-t-il ?',
    opciones: PROGRAMAS, bien: ['bloc'], pista: 'Mira el nombre que sale arriba en la ventana. · Regarde le nom en haut de la fenêtre.' },
  { id: 'p2', texto: 'Doble clic en <b>dibujo.png</b>. ¿Con qué programa se ha abierto? · Avec quel programme s’ouvre-t-il ?',
    opciones: PROGRAMAS, bien: ['fotos', 'paint'], pista: 'Mira el nombre que sale arriba en la ventana. · Regarde le nom en haut de la fenêtre.' },
  { id: 'p3', texto: '¿Por qué cada archivo se abre con un programa distinto? · Pourquoi un programme différent ?',
    opciones: [
      ['nombre', 'Por el nombre (yo, dibujo) · Par le nom'],
      ['ext', 'Por lo que va detrás del punto (.txt, .png) · Par ce qui suit le point'],
      ['carpeta', 'Por la carpeta donde está · Par le dossier'],
    ],
    bien: ['ext'], pista: 'Fíjate en el final del nombre: <b>.txt</b> y <b>.png</b>. · Regarde la fin du nom.' },
];

// "Dibujo.PNG" → { base: "dibujo", ext: "png" }
function partes(nombre) {
  const i = nombre.lastIndexOf('.');
  return i > 0 ? { base: norm(nombre.slice(0, i)), ext: nombre.slice(i + 1).toLowerCase() } : { base: norm(nombre), ext: '' };
}

export function montar({ perfil, records, caja, marcadorEl }) {
  const NOMBRE = nombreCarpeta(perfil);
  const q = sel => caja.querySelector(sel);
  let vivo = true;
  const respondidas = new Set();
  let fallosPreguntas = 0;
  const urls = [];

  marcadorEl.innerHTML = records[EJ] != null ? '<span>✅ <b>Ya la has hecho</b> · Déjà faite</span>' : '';
  if (!puedeLeerCarpetas()) { caja.innerHTML = TITULO + avisoNavegador; return () => {}; }

  const cajaPregunta = p => `<div class="pregunta" data-id="${p.id}">
      <p>${p.texto}</p>
      <div class="opciones">${p.opciones.map(([v, t]) => `<button class="ghost" data-v="${v}">${t}</button>`).join('')}</div>
      <p class="pista"></p>
    </div>`;

  caja.innerHTML = `${TITULO}
    <p>Sin prisa: aquí no hay reloj. Hazlo en Windows y marca cada paso. · Pas de chrono : fais-le dans Windows.</p>

    <h3>1 · Un texto con el Bloc de notas · Un texte avec le Bloc-notes</h3>
    <ul class="checklist">
      <li><label><input type="checkbox"> Pulsa <b>⊞</b>, escribe <b>bloc</b> y pulsa <b>Intro</b>. · Appuie sur ⊞, écris « bloc », Entrée.</label></li>
      <li><label><input type="checkbox"> Escribe: <i>Me llamo … Tengo … años. Me gusta …</i> · Écris : Je m’appelle… J’ai… ans. J’aime…</label></li>
      <li><label><input type="checkbox"> <b>Archivo → Guardar como</b>. Busca <b>Documentos → ${esc(NOMBRE)}</b> y entra con doble clic. No entres en Textos: lo ordenarás después.
        <span class="muted">· Fichier → Enregistrer sous. Va dans ton dossier (pas dans Textos).</span></label></li>
      <li><label><input type="checkbox"> Nombre: <span class="nombre">yo</span> → <b>Guardar</b>. Cierra el Bloc de notas. · Nom : yo → Enregistrer.</label></li>
    </ul>

    <h3>2 · Un dibujo con Paint · Un dessin avec Paint</h3>
    <ul class="checklist">
      <li><label><input type="checkbox"> Pulsa <b>⊞</b>, escribe <b>paint</b> y pulsa <b>Intro</b>. · Appuie sur ⊞, écris « paint », Entrée.</label></li>
      <li><label><input type="checkbox"> Dibuja lo que quieras: tu nombre, una casa, un balón… Para pintar, mantén el clic y mueve.
        <span class="muted">Con el pad: aprieta hasta que haga clic y, sin soltar, mueve el dedo. · Garde le clic enfoncé et bouge.</span></label></li>
      <li><label><input type="checkbox"> <b>Archivo → Guardar como</b>. ¡Ojo! Paint abre la carpeta <b>Imágenes</b>: cámbiala a <b>Documentos → ${esc(NOMBRE)}</b>.
        <span class="muted">· Attention : Paint ouvre « Images ». Va dans ton dossier.</span></label></li>
      <li><label><input type="checkbox"> Nombre: <span class="nombre">dibujo</span> → <b>Guardar</b>. Cierra Paint. · Nom : dibujo → Enregistrer.</label></li>
    </ul>

    <h3>3 · Doble clic · Double-clic</h3>
    <p>Abre tu carpeta en el Explorador (<b>⊞ + E</b> → Documentos → ${esc(NOMBRE)}) y haz doble clic en cada archivo.
      <span class="muted">· Ouvre ton dossier et fais double-clic sur chaque fichier.</span></p>
    ${PREGUNTAS.map(cajaPregunta).join('')}

    <h3>4 · Ordena · Range</h3>
    <ul class="checklist">
      <li><label><input type="checkbox"> <b>yo.txt</b> a <b>Textos</b>: un clic en el archivo, <b>Ctrl + X</b>; doble clic en Textos, <b>Ctrl + V</b>. · Ctrl + X, puis Ctrl + V dans Textos.</label></li>
      <li><label><input type="checkbox"> <b>dibujo.png</b> a <b>Fotos</b>, igual. También puedes arrastrarlo encima de la carpeta. · Pareil dans Fotos.</label></li>
    </ul>

    <h3>5 · Comprobar · Vérifier</h3>
    <p>Pulsa <b>Comprobar</b> y haz un clic en tu carpeta <span class="nombre">${esc(NOMBRE)}</span> → <b>Seleccionar carpeta</b>.</p>
    <div class="fila"><button id="btn-comprobar" class="grande">🔍 Comprobar · Vérifier</button></div>
    <div id="revision"></div>`;

  for (const div of caja.querySelectorAll('.pregunta')) {
    const p = PREGUNTAS.find(x => x.id === div.dataset.id);
    div.querySelector('.opciones').onclick = e => {
      const b = e.target.closest('button'); if (!b || respondidas.has(p.id)) return;
      if (p.bien.includes(b.dataset.v)) {
        respondidas.add(p.id);
        b.classList.remove('ghost'); b.classList.add('acierto');
        div.querySelectorAll('button').forEach(x => { x.disabled = x !== b; });
        div.querySelector('.pista').innerHTML = p.id === 'p3'
          ? '✅ ¡Eso es! La <b>extensión</b> (.txt, .png) le dice a Windows con qué programa abrirlo. · L’extension choisit le programme.'
          : '✅ ¡Bien! · Bien !';
        sonar('ok');
      } else {
        fallosPreguntas++;
        b.disabled = true;
        div.querySelector('.pista').innerHTML = '🤔 No. ' + p.pista;
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
      lineas.push(`<li>Faltan las carpetas <b>${faltanCarpetas.join(', ')}</b>. Haz antes la misión 1. · Fais d’abord la mission 1.</li>`);
    }

    for (const a of ARCHIVOS) {
      const iguales = entradas.filter(e => { const p = partes(e.h.name); return p.base === a.base && a.exts.includes(p.ext); });
      if (iguales.length === 1 && iguales[0].donde === a.carpeta) {
        lineas.push(`<li class="bien"><b>${esc(iguales[0].h.name)}</b> está en ${a.carpeta}</li>`);
        encontrados.push({ a, h: iguales[0].h });
        continue;
      }
      todoBien = false;
      if (iguales.length > 1) {
        const sitios = iguales.map(e => e.donde || esc(NOMBRE));
        lineas.push(`<li><b>${a.nombre}</b> está en dos sitios (${sitios.join(' y ')}): lo has <b>copiado</b> en vez de moverlo. Deja solo el de ${a.carpeta} y borra el otro.
          <span class="muted">· Il est à deux endroits : tu l’as copié au lieu de le déplacer.</span></li>`);
      } else if (iguales.length === 1 && !iguales[0].donde) {
        lineas.push(`<li><b>${esc(iguales[0].h.name)}</b> está suelto en tu carpeta. Muévelo a <b>${a.carpeta}</b>: Ctrl + X, entra en ${a.carpeta}, Ctrl + V.
          <span class="muted">· Déplace-le dans ${a.carpeta}.</span></li>`);
      } else if (iguales.length === 1) {
        lineas.push(`<li><b>${esc(iguales[0].h.name)}</b> está en <b>${iguales[0].donde}</b>, pero es un ${a.tipo}: va en <b>${a.carpeta}</b>.
          <span class="muted">· Il doit aller dans ${a.carpeta}.</span></li>`);
      } else {
        // No está: ¿tiene otro nombre?
        const parecido = entradas.find(e => {
          const p = partes(e.h.name);
          return (p.base.startsWith(a.base) || p.base.startsWith('sintitulo')) && (a.exts.includes(p.ext) || p.base.startsWith(a.base));
        });
        if (parecido && partes(parecido.h.name).base.startsWith('sintitulo')) {
          lineas.push(`<li>Hay un archivo <b>${esc(parecido.h.name)}</b>: se ha guardado sin nombre. Cámbiale el nombre a <b>${a.base}</b> (clic derecho → Cambiar nombre).
            <span class="muted">· Renomme-le « ${a.base} ».</span></li>`);
        } else if (parecido) {
          lineas.push(`<li>Hay un archivo <b>${esc(parecido.h.name)}</b>, pero tiene que llamarse <b>${a.nombre}</b>. Mira bien el final del nombre y cámbialo (clic derecho → Cambiar nombre).
            <span class="muted">· Le nom doit être ${a.nombre}.</span></li>`);
        } else {
          lineas.push(`<li>No encuentro <b>${a.nombre}</b> en tu carpeta. Seguramente se ha guardado en <b>${a.dondeSuele}</b>. Búscalo allí y muévelo a tu carpeta, o ábrelo y usa <b>Guardar como</b> mirando bien dónde.
            <span class="muted">· Je ne le trouve pas. Il est peut-être dans ${a.dondeSuele}.</span></li>`);
        }
      }
    }

    if (!todoBien) {
      sonar('fallo');
      return mostrar(`<p>Aún no está todo: · Pas encore :</p><ul class="revision">${lineas.join('')}</ul>
        <p class="muted">Arréglalo y pulsa <b>Comprobar</b> otra vez. · Corrige et clique encore sur Vérifier.</p>`);
    }
    if (respondidas.size < PREGUNTAS.length) {
      sonar('fallo');
      return mostrar(`<ul class="revision">${lineas.join('')}</ul>
        <p>Los archivos están bien. Te faltan las preguntas del <b>paso 3</b>. · Il te manque les questions de l’étape 3.</p>`);
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
    caja.innerHTML = `<h2>¡Misión cumplida! · Mission accomplie !</h2>
      <ul class="revision">${lineas.join('')}</ul>
      <div class="premio">
        ${texto ? `<figure><figcaption>📝 Tu texto · Ton texte</figcaption><pre>${esc(texto)}</pre></figure>` : ''}
        ${imagen ? `<figure><figcaption>🎨 Tu dibujo · Ton dessin</figcaption><img src="${imagen}" alt="Tu dibujo"></figure>` : ''}
      </div>
      <p class="muted" id="guardado">Guardando…</p>`;
    const ok = await guardarIntento({
      ejercicio: EJ, valor: 1, errores: fallosPreguntas,
      acierto: Math.round(PREGUNTAS.length / (PREGUNTAS.length + fallosPreguntas) * 1000) / 10,
    });
    if (!vivo || !q('#guardado')) return;
    q('#guardado').textContent = ok ? '✓ Guardado · Enregistré' : 'No se ha podido guardar';
    if (ok) { records[EJ] = 1; marcadorEl.innerHTML = '<span>✅ <b>Ya la has hecho</b> · Déjà faite</span>'; }
  }

  return () => { vivo = false; urls.forEach(u => URL.revokeObjectURL(u)); };
}

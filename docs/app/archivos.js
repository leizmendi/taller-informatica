// Archivos y carpetas. Las misiones se hacen en el Explorador de Windows de verdad;
// la página da la misión, cronometra y comprueba el resultado leyendo la carpeta
// que elige el alumno (File System Access API: solo Edge y Chrome).
import { exigirSesion, guardarIntento, misMejores, calcularRecords, mejora, mensajeRecord, sonar, celebrar, esc, fmt } from './comun.js';
import { EJERCICIOS, formatoValor } from './ejercicios.js';

const $ = id => document.getElementById(id);
const perfil = await exigirSesion();
const records = calcularRecords(await misMejores());

const EJ = 'arch-carpeta';
const SUBCARPETAS = ['Textos', 'Fotos', 'Web'];
const NOMBRE = `Taller - ${perfil.apodo}`;

// Compara nombres sin fijarse en mayúsculas, tildes, espacios ni guiones:
// "Taller – Ana", "taller-ana" y "Taller Ana" valen igual.
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s\-–—_.]+/g, '');
const esMiCarpeta = nombre => norm(nombre) === norm(NOMBRE);

let juego = null;        // { inicio, timer, errores }
let elegida = null;      // carpeta que eligió el alumno en la ventana de Windows
let ultimaCarpeta = null; // carpeta con la que se superó la misión (para repetir)

const textoRecord = () => records[EJ] != null
  ? `<span>🏆 Récord <b>${formatoValor(EJERCICIOS[EJ], records[EJ])}</b></span>` : '';

function marcador() {
  if (!juego) { $('marcador').innerHTML = textoRecord(); return; }
  const s = (performance.now() - juego.inicio) / 1000;
  $('marcador').innerHTML = `<span>⏱️ <b>${fmt(s, 0)}</b> s</span>
    <span>Intentos fallidos · Essais ratés <b>${juego.errores}</b></span>
    ${textoRecord()}`;
}

const arbol = `<p class="arbol">📂 Documentos · Documents<br>
  &nbsp;&nbsp;└ 📁 <b>${esc(NOMBRE)}</b><br>
  ${SUBCARPETAS.map((c, i) => `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${i < SUBCARPETAS.length - 1 ? '├' : '└'} 📁 ${c}`).join('<br>')}</p>`;

const pasos = `<ol class="pasos">
  <li>Abre el Explorador con <b>⊞ + E</b> y haz clic en <b>Documentos</b>, a la izquierda. · Ouvre l’Explorateur (⊞ + E) et clique sur Documents.</li>
  <li><b>Clic derecho</b> en un sitio vacío de Documentos → <b>Nuevo</b> → <b>Carpeta</b>.
    <span class="muted">Con el pad: toca con dos dedos a la vez. · Avec le pavé : touche avec deux doigts.</span></li>
  <li>Escribe <span class="nombre">${esc(NOMBRE)}</span> y pulsa <b>Intro ↵</b>. · Écris le nom et appuie sur Entrée.</li>
  <li><b>Doble clic</b> para entrar y crea dentro tres carpetas: <b>Textos</b>, <b>Fotos</b> y <b>Web</b>. · Dedans, crée trois dossiers.</li>
  <li>Vuelve aquí y pulsa <b>Comprobar</b>. Se abre una ventana en Documentos: haz <b>un clic</b> en tu carpeta <span class="nombre">${esc(NOMBRE)}</span> (sin entrar en ella), pulsa <b>Seleccionar carpeta</b> y después <b>Ver archivos</b>.
    <span class="muted">· Reviens ici et clique sur Vérifier. Un clic sur ton dossier, puis « Sélectionner le dossier ».</span></li>
</ol>`;

function inicio() {
  juego = null;
  marcador();
  if (!('showDirectoryPicker' in window)) {
    $('mision').innerHTML = `<h2>Misión: crea tu carpeta · Crée ton dossier</h2>
      <p class="error">Este navegador no puede comprobar carpetas. Abre la app en <b>Edge</b> o <b>Chrome</b>.<br>
      Ce navigateur ne peut pas vérifier les dossiers. Ouvre l’app dans Edge ou Chrome.</p>`;
    return;
  }
  $('mision').innerHTML = `<h2>Misión: crea tu carpeta · Crée ton dossier</h2>
    <p>Tienes que hacerlo en el <b>Explorador de Windows</b>, no aquí. Al final tiene que quedar así:<br>
    <span class="muted">Tu le fais dans Windows, pas ici. À la fin, ça doit être comme ça :</span></p>
    ${arbol}
    <div><button id="btn-empezar" class="grande">▶ Empezar · Commencer</button></div>`;
  $('btn-empezar').onclick = empezar;
}

function empezar() {
  elegida = null;
  juego = { inicio: performance.now(), timer: setInterval(marcador, 500), errores: 0 };
  marcador();
  $('mision').innerHTML = `<h2>Misión: crea tu carpeta · Crée ton dossier</h2>
    ${pasos}
    ${arbol}
    <div class="fila"><button id="btn-comprobar" class="grande">🔍 Comprobar · Vérifier</button></div>
    <div id="revision"></div>`;
  $('btn-comprobar').onclick = comprobar;
}

// Lista lo que hay dentro de una carpeta. Si la carpeta ya no existe
// (la han borrado o le han cambiado el nombre), lanza NotFoundError.
async function contenido(dir) {
  const r = [];
  for await (const h of dir.values()) r.push(h);
  return r;
}

async function hayArchivos(dir) {
  for (const h of await contenido(dir)) {
    if (h.kind === 'file' || await hayArchivos(h)) return true;
  }
  return false;
}

function mostrar(html) { $('revision').innerHTML = html; }

function fallo(html) {
  juego.errores++;
  marcador();
  sonar('fallo');
  mostrar(html);
}

async function comprobar() {
  if (!juego) return;
  if (!elegida) {
    try {
      elegida = await showDirectoryPicker({ id: 'taller', mode: 'read', startIn: 'documents' });
    } catch (e) {
      if (e.name !== 'AbortError') mostrar(`<p class="error">No se ha podido abrir la carpeta. Prueba otra vez o pide ayuda al monitor.</p>`);
      return; // ha cerrado la ventana sin elegir: no cuenta como fallo
    }
  }
  if (!juego) return;

  // ¿Qué carpeta ha elegido? Lo normal es su carpeta. Edge y Chrome no dejan elegir
  // Documentos ni el Escritorio enteros ("contiene archivos del sistema"), pero si eligen otra
  // carpeta que la contiene, también vale.
  let raiz = null, dentro, fuera = [];
  try {
    if (esMiCarpeta(elegida.name)) raiz = elegida;
    else {
      fuera = (await contenido(elegida)).filter(h => h.kind === 'directory');
      raiz = fuera.find(h => esMiCarpeta(h.name)) || null;
    }
    if (raiz) dentro = await contenido(raiz);
  } catch (e) {
    elegida = null;
    if (e.name === 'NotFoundError') {
      return mostrar(`<p>Ya no encuentro la carpeta que elegiste (¿le has cambiado el nombre?). Pulsa <b>Comprobar</b> y elígela otra vez.<br>
        <span class="muted">Je ne trouve plus le dossier. Clique sur Vérifier et choisis-le encore.</span></p>`);
    }
    return mostrar(`<p class="error">No se ha podido leer la carpeta. Pide ayuda al monitor.</p>`);
  }

  if (!raiz) {
    // Si ha elegido la carpeta de fuera, mira si allí hay una carpeta con el nombre mal puesto
    const casi = fuera.find(h => norm(h.name).startsWith('taller') || /^nueva carpeta/i.test(h.name));
    const nombre = casi ? casi.name : elegida.name;
    elegida = null; // la próxima vez vuelve a preguntar
    if (SUBCARPETAS.some(c => norm(c) === norm(nombre))) {
      return fallo(`<p>Has elegido <b>${esc(nombre)}</b>, que va dentro. Elige la carpeta de fuera: <span class="nombre">${esc(NOMBRE)}</span>.<br>
        <span class="muted">Tu as choisi un dossier de l’intérieur. Choisis celui de dehors.</span></p>`);
    }
    if (norm(nombre).startsWith('taller') || /^nueva carpeta/i.test(nombre)) {
      return fallo(`<p>Tu carpeta se llama <b>${esc(nombre)}</b>, pero tiene que llamarse <span class="nombre">${esc(NOMBRE)}</span>.
        Cámbiale el nombre: <b>clic derecho → Cambiar nombre</b>.<br>
        <span class="muted">Le nom n’est pas bon. Clic droit → Renommer.</span></p>`);
    }
    return fallo(`<p>Has elegido <b>${esc(nombre)}</b> y ahí no está <span class="nombre">${esc(NOMBRE)}</span>.
      Pulsa <b>Comprobar</b> otra vez y haz un clic en tu carpeta (está en Documentos).<br>
      <span class="muted">Ce n’est pas ton dossier. Il est dans Documents.</span></p>`);
  }

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
    if (donde) lineas.push(`<li><b>${c}</b> está dentro de <b>${esc(donde)}</b>. Tiene que estar al lado, no dentro: arrástrala a <b>${esc(raiz.name)}</b>.
      <span class="muted">· ${c} est dans ${esc(donde)} : glisse-le dehors.</span></li>`);
    else if (dentro.some(h => h.kind === 'file' && norm(h.name).startsWith(norm(c))))
      lineas.push(`<li><b>${c}</b> es un archivo, no una carpeta. Bórralo y crea una carpeta (Nuevo → Carpeta).
        <span class="muted">· C’est un fichier, pas un dossier.</span></li>`);
    else lineas.push(`<li>Falta la carpeta <b>${c}</b>. · Il manque le dossier ${c}.</li>`);
  }
  for (const h of carpetas) {
    if (/^nueva carpeta/i.test(h.name)) {
      todoBien = false;
      lineas.push(`<li>Hay una carpeta <b>${esc(h.name)}</b>: cámbiale el nombre (clic derecho → Cambiar nombre).
        <span class="muted">· Renomme le dossier « ${esc(h.name)} ».</span></li>`);
    }
  }

  if (!todoBien) {
    return fallo(`<p>He encontrado tu carpeta <b>${esc(raiz.name)}</b>, pero aún no está lista: · Ton dossier n’est pas encore prêt :</p>
      <ul class="revision">${lineas.join('')}</ul>
      <p class="muted">Arréglalo y pulsa <b>Comprobar</b> otra vez. · Corrige et clique encore sur Vérifier.</p>`);
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
  $('mision').innerHTML = `<h2>¡Misión cumplida! · Mission accomplie !</h2>
    <ul class="revision">${lineas.join('')}</ul>
    <p class="marcador"><span>Tiempo <b>${fmt(s, 1)}</b> s</span><span>Intentos fallidos <b>${errores}</b></span></p>
    <p id="record"></p>
    <p class="muted" id="guardado">Guardando…</p>
    <div class="fila">
      <button id="btn-otra">Otra vez · Encore</button>
      <a class="btn ghost" href="clasificacion.html?ej=${EJ}">🏆 Clasificación</a>
    </div>
    <div id="revision"></div>`;
  $('btn-otra').onclick = otraVez;

  const ej = EJERCICIOS[EJ], valor = Math.round(s * 10) / 10, previo = records[EJ];
  if (previo != null && mejora(ej, valor, previo)) { sonar('record'); celebrar(); } else sonar('ok');
  const ok = await guardarIntento({
    ejercicio: EJ, valor, segundos: valor, errores,
    acierto: Math.round(1000 / (1 + errores)) / 10,
  });
  if (!$('guardado')) return;
  if (!ok) { $('guardado').textContent = 'No se ha podido guardar'; return; }
  $('guardado').textContent = '✓ Guardado · Enregistré';
  $('record').innerHTML = mensajeRecord(ej, valor, previo);
  if (mejora(ej, valor, previo)) { records[EJ] = valor; marcador(); }
}

// Para repetir hay que borrar antes la carpeta, si no la misión ya estaría hecha.
// Pero nunca se pide borrarla si ya tiene archivos suyos dentro.
async function otraVez() {
  if (!ultimaCarpeta) return empezar();
  try {
    if (await hayArchivos(ultimaCarpeta)) {
      return mostrar(`<p>Tu carpeta ya tiene archivos tuyos dentro, así que <b>no la borres</b>. Tu tiempo ya está guardado.<br>
        <span class="muted">Ton dossier a déjà tes fichiers : ne l’efface pas.</span></p>`);
    }
  } catch (e) {
    if (e.name === 'NotFoundError') { ultimaCarpeta = null; return empezar(); } // ya la ha borrado
    return empezar();
  }
  mostrar(`<p>Para repetir, primero <b>borra tu carpeta</b>: clic derecho sobre ella → <b>Eliminar</b> (va a la papelera). Después pulsa <b>Otra vez</b>.<br>
    <span class="muted">Pour recommencer, efface d’abord ton dossier (clic droit → Supprimer), puis clique sur Encore.</span></p>`);
}

inicio();

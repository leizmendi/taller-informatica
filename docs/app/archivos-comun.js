// Código compartido por las misiones de "Archivos y carpetas" que leen la carpeta
// real del alumno (File System Access API: solo Edge y Chrome).
import { esc } from './comun.js';

export const SUBCARPETAS = ['Textos', 'Fotos', 'Web'];
export const nombreCarpeta = perfil => `Taller - ${perfil.apodo}`;

// Compara nombres sin fijarse en mayúsculas, tildes, espacios ni guiones:
// "Taller – Ana", "taller-ana" y "Taller Ana" valen igual.
export const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s\-–—_.]+/g, '');

export const puedeLeerCarpetas = () => 'showDirectoryPicker' in window;
export const avisoNavegador = `<p class="error">Este navegador no puede comprobar carpetas. Abre la app en <b>Edge</b> o <b>Chrome</b>.<br>
  Ce navigateur ne peut pas vérifier les dossiers. Ouvre l’app dans Edge ou Chrome.</p>`;

// Lista lo que hay dentro de una carpeta. Si la carpeta ya no existe
// (la han borrado o le han cambiado el nombre), lanza NotFoundError.
export async function contenido(dir) {
  const r = [];
  for await (const h of dir.values()) r.push(h);
  return r;
}

export async function hayArchivos(dir) {
  for (const h of await contenido(dir)) {
    if (h.kind === 'file' || await hayArchivos(h)) return true;
  }
  return false;
}

// La carpeta elegida en la ventana de Windows se recuerda entre misiones,
// para no tener que elegirla cada vez.
let elegida = null;
export const olvidarCarpeta = () => { elegida = null; };

// Pide la carpeta si hace falta. Devuelve false si cierran la ventana sin elegir.
export async function pedirCarpeta() {
  if (elegida) return true;
  try {
    elegida = await showDirectoryPicker({ id: 'taller', mode: 'read', startIn: 'documents' });
    return true;
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
    return false;
  }
}

// Busca su carpeta "Taller - apodo" a partir de la elegida. Edge y Chrome no dejan
// elegir Documentos ni el Escritorio enteros ("contiene archivos del sistema"),
// así que lo normal es que elijan su carpeta; si eligen otra que la contiene, también vale.
// Devuelve { raiz, dentro } o { error: html } (y entonces olvida la carpeta elegida).
export async function localizar(perfil) {
  const NOMBRE = nombreCarpeta(perfil);
  const esMia = n => norm(n) === norm(NOMBRE);
  let raiz = null, dentro, fuera = [];
  try {
    if (esMia(elegida.name)) raiz = elegida;
    else {
      fuera = (await contenido(elegida)).filter(h => h.kind === 'directory');
      raiz = fuera.find(h => esMia(h.name)) || null;
    }
    if (raiz) dentro = await contenido(raiz);
  } catch (e) {
    elegida = null;
    if (e.name === 'NotFoundError') {
      return { error: `<p>Ya no encuentro la carpeta que elegiste (¿le has cambiado el nombre?). Pulsa <b>Comprobar</b> y elígela otra vez.<br>
        <span class="muted">Je ne trouve plus le dossier. Clique sur Vérifier et choisis-le encore.</span></p>`, sinFallo: true };
    }
    return { error: `<p class="error">No se ha podido leer la carpeta. Pide ayuda al monitor.</p>`, sinFallo: true };
  }
  if (raiz) return { raiz, dentro };

  // Si ha elegido la carpeta de fuera, mira si allí hay una carpeta con el nombre mal puesto
  const casi = fuera.find(h => norm(h.name).startsWith('taller') || /^nueva carpeta/i.test(h.name));
  const nombre = casi ? casi.name : elegida.name;
  elegida = null; // la próxima vez vuelve a preguntar
  if (SUBCARPETAS.some(c => norm(c) === norm(nombre))) {
    return { error: `<p>Has elegido <b>${esc(nombre)}</b>, que va dentro. Elige la carpeta de fuera: <span class="nombre">${esc(NOMBRE)}</span>.<br>
      <span class="muted">Tu as choisi un dossier de l’intérieur. Choisis celui de dehors.</span></p>` };
  }
  if (norm(nombre).startsWith('taller') || /^nueva carpeta/i.test(nombre)) {
    return { error: `<p>Tu carpeta se llama <b>${esc(nombre)}</b>, pero tiene que llamarse <span class="nombre">${esc(NOMBRE)}</span>.
      Cámbiale el nombre: <b>clic derecho → Cambiar nombre</b>.<br>
      <span class="muted">Le nom n’est pas bon. Clic droit → Renommer.</span></p>` };
  }
  return { error: `<p>Has elegido <b>${esc(nombre)}</b> y ahí no está <span class="nombre">${esc(NOMBRE)}</span>.
    Pulsa <b>Comprobar</b> otra vez y haz un clic en tu carpeta (está en Documentos).<br>
    <span class="muted">Ce n’est pas ton dossier. Il est dans Documents.</span></p>` };
}

// Elige (si hace falta) y localiza su carpeta. Devuelve null si ha cerrado la ventana.
export async function leerMiCarpeta(perfil) {
  try {
    if (!await pedirCarpeta()) return null;
  } catch {
    return { error: `<p class="error">No se ha podido abrir la carpeta. Prueba otra vez o pide ayuda al monitor.</p>`, sinFallo: true };
  }
  return localizar(perfil);
}

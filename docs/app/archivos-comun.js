// Código compartido por las misiones de "Archivos y carpetas" que leen la carpeta
// real del alumno (File System Access API: solo Edge y Chrome).
import { esc } from './comun.js';
import { t } from './i18n.js';

export const SUBCARPETAS = ['Textos', 'Fotos', 'Web'];
export const nombreCarpeta = perfil => `Taller - ${perfil.apodo}`;

// Compara nombres sin fijarse en mayúsculas, tildes, espacios ni guiones:
// "Taller – Ana", "taller-ana" y "Taller Ana" valen igual.
export const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s\-–—_.]+/g, '');

export const puedeLeerCarpetas = () => 'showDirectoryPicker' in window;
export const avisoNavegador = () => `<p class="error">${t('arch.navegador')}</p>`;

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
      return { error: `<p>${t('arch.yaNo')}</p>`, sinFallo: true };
    }
    return { error: `<p class="error">${t('arch.noLeer')}</p>`, sinFallo: true };
  }
  if (raiz) return { raiz, dentro };

  // Si ha elegido la carpeta de fuera, mira si allí hay una carpeta con el nombre mal puesto
  const casi = fuera.find(h => norm(h.name).startsWith('taller') || /^nueva carpeta/i.test(h.name));
  const nombre = casi ? casi.name : elegida.name;
  elegida = null; // la próxima vez vuelve a preguntar
  if (SUBCARPETAS.some(c => norm(c) === norm(nombre))) {
    return { error: `<p>${t('arch.elegisteDentro', { nombre: esc(nombre), carpeta: esc(NOMBRE) })}</p>` };
  }
  if (norm(nombre).startsWith('taller') || /^nueva carpeta/i.test(nombre)) {
    return { error: `<p>${t('arch.nombreMal', { nombre: esc(nombre), carpeta: esc(NOMBRE) })}</p>` };
  }
  return { error: `<p>${t('arch.noEsTuya', { nombre: esc(nombre), carpeta: esc(NOMBRE) })}</p>` };
}

// Elige (si hace falta) y localiza su carpeta. Devuelve null si ha cerrado la ventana.
export async function leerMiCarpeta(perfil) {
  try {
    if (!await pedirCarpeta()) return null;
  } catch {
    return { error: `<p class="error">${t('arch.noAbrir')}</p>`, sinFallo: true };
  }
  return localizar(perfil);
}

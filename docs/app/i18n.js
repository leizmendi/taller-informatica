// Idiomas de la app. Cada persona elige un idioma principal y, si quiere,
// uno secundario que se ve al lado en cursiva y en otro color.
// Los textos están en idiomas/<código>.js; la lista de idiomas, en idiomas/lista.js.
//
// Uso:
//   t('clave')            → texto principal + secundario (HTML)
//   t('clave', { n: 3 })  → con datos: en el texto se escribe {n}
//   t1('clave')           → solo el principal, con HTML (títulos de botón, opciones…)
//   tPlano('clave')       → solo el principal y sin HTML (title, confirm, prompt)
// Si a un idioma le falta un texto, el principal sale en castellano y el
// secundario no se muestra (para no repetir lo mismo dos veces).
import { IDIOMAS } from './idiomas/lista.js';
import { IDIOMA_PRINCIPAL, IDIOMA_SECUNDARIO } from './config.js';

const CLAVE_LS = 'taller-idiomas';
export const NINGUNO = '-'; // secundario: ninguno

let principal = 'es', secundario = null;
let P = {}, S = null, ES = {};

const valido = c => Object.hasOwn(IDIOMAS, c);

// Lo elegido en este ordenador, o lo que diga config.js
export function idiomasGuardados() {
  const [p, s] = (localStorage.getItem(CLAVE_LS) || '').split(',');
  return {
    principal: valido(p) ? p : IDIOMA_PRINCIPAL,
    secundario: s === NINGUNO || valido(s) ? s : IDIOMA_SECUNDARIO || NINGUNO,
  };
}

export function recordarIdiomas(p, s) {
  localStorage.setItem(CLAVE_LS, `${p},${s || NINGUNO}`);
}

async function cargar(codigo) {
  try { return (await import(`./idiomas/${codigo}.js`)).default; }
  catch (e) { console.error(`No se ha podido cargar el idioma ${codigo}`, e); return {}; }
}

export async function iniciarIdiomas({ principal: p, secundario: s }) {
  principal = valido(p) ? p : 'es';
  secundario = valido(s) && s !== principal ? s : null;
  [ES, P, S] = await Promise.all([cargar('es'), principal === 'es' ? null : cargar(principal), secundario ? cargar(secundario) : null]);
  if (principal === 'es') P = ES;
  document.documentElement.lang = principal;
}

export const idiomaPrincipal = () => principal;
export const idiomaSecundario = () => secundario;

function buscar(dic, clave, datos) {
  let x = dic?.[clave];
  if (x == null) return null;
  return x.replace(/\{(\w+)\}/g, (m, k) => (datos && k in datos ? datos[k] : m));
}

export function t1(clave, datos) {
  const x = buscar(P, clave, datos) ?? buscar(ES, clave, datos);
  if (x == null) console.warn('Falta el texto', clave);
  return x ?? clave;
}

export function t2(clave, datos) {
  return S ? buscar(S, clave, datos) : null;
}

export function t(clave, datos) {
  const a = t1(clave, datos), b = t2(clave, datos);
  return b && b !== a ? `${a} <span class="sec" lang="${secundario}">${b}</span>` : a;
}

export function tPlano(clave, datos) {
  const d = document.createElement('div');
  d.innerHTML = t1(clave, datos);
  return d.textContent;
}

// Textos fijos de las páginas: <h1 data-t="clave"></h1> (con data-t-n="3" para {n}), <title data-t1="clave">,
// <input data-t-placeholder="clave">, <x data-t-title="clave">
export function traducirPagina(raiz = document) {
  for (const el of raiz.querySelectorAll('[data-t]')) el.innerHTML = t(el.dataset.t, el.dataset.tN ? { n: el.dataset.tN } : undefined);
  for (const el of raiz.querySelectorAll('[data-t1]')) el.innerHTML = t1(el.dataset.t1);
  for (const el of raiz.querySelectorAll('[data-t-placeholder]')) el.placeholder = tPlano(el.dataset.tPlaceholder);
  for (const el of raiz.querySelectorAll('[data-t-title]')) el.title = tPlano(el.dataset.tTitle);
  const titulo = document.querySelector('title[data-t1]');
  if (titulo) document.title = tPlano(titulo.dataset.t1);
}

// Selectores de idioma principal y secundario (cabecera y pantalla de entrada)
export function selectoresIdioma() {
  const op = (c, elegido) => `<option value="${c}"${c === elegido ? ' selected' : ''}>${IDIOMAS[c]}</option>`;
  return `<label>${t1('idioma.principal')}
      <select id="sel-idioma">${Object.keys(IDIOMAS).map(c => op(c, principal)).join('')}</select></label>
    <label>${t1('idioma.secundario')}
      <select id="sel-idioma2"><option value="${NINGUNO}">${t1('idioma.ninguno')}</option>${Object.keys(IDIOMAS).map(c => op(c, secundario)).join('')}</select></label>`;
}

export { IDIOMAS };

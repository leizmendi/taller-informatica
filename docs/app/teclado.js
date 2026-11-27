import { t } from './i18n.js';
// Teclado español en pantalla, con colores por dedo.
// Dedos: mi/ai/ci/ii = meñique/anular/corazón/índice izquierdo;
//        id/cd/ad/md = índice/corazón/anular/meñique derecho; pu = pulgar.

const FILAS = [
  [['º','mi'],['1','mi'],['2','ai'],['3','ci'],['4','ii'],['5','ii'],['6','id'],['7','id'],['8','cd'],['9','ad'],['0','md'],["'",'md'],['¡','md'],['⌫','md',8]],
  [['Tab','mi',6],['q','mi'],['w','ai'],['e','ci'],['r','ii'],['t','ii'],['y','id'],['u','id'],['i','cd'],['o','ad'],['p','md'],['`','md'],['+','md'],['↵','md',6]],
  [['Bloq','mi',7],['a','mi'],['s','ai'],['d','ci'],['f','ii'],['g','ii'],['h','id'],['j','id'],['k','cd'],['l','ad'],['ñ','md'],['´','md'],['ç','md'],['','md',5]],
  [['⇧','mi',5],['<','mi'],['z','mi'],['x','ai'],['c','ci'],['v','ii'],['b','ii'],['n','id'],['m','id'],[',','cd'],['.','ad'],['-','md'],['⇧ ','md',11]],
  [['Ctrl','mi',6],['Alt','pu',5],[' ','pu',37],['Alt Gr','pu',6],['Ctrl ','md',6]],
];

const DEDO_DE = {};
for (const fila of FILAS) for (const [k, d] of fila) DEDO_DE[k] = d;
const MANO_IZQ = new Set(['mi', 'ai', 'ci', 'ii']);

// Con mayúscula
const SHIFT = { 'ª':'º', '!':'1', '"':'2', '·':'3', '$':'4', '%':'5', '&':'6', '/':'7', '(':'8', ')':'9', '=':'0',
  '?':"'", '¿':'¡', '^':'`', '*':'+', '¨':'´', 'Ç':'ç', '>':'<', ';':',', ':':'.', '_':'-' };
const ALTGR = { '@':'2', '#':'3', '€':'e', '\\':'º', '|':'1', '[':'`', ']':'+', '{':'´', '}':'ç' };
const ACENTO = { 'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u' };
const ACENTO_MAY = { 'Á':'a', 'É':'e', 'Í':'i', 'Ó':'o', 'Ú':'u' };
const DIERESIS = { 'ü':'u', 'Ü':'u', 'ë':'e', 'ï':'i' };
// Francés: acento grave con ` y circunflejo con ⇧ + `
const GRAVE = { 'à':'a', 'è':'e', 'ù':'u' };
const CIRCUNFLEJO = { 'â':'a', 'ê':'e', 'î':'i', 'ô':'o', 'û':'u' };

// Qué símbolo lleva cada tecla con ⇧ y con Alt Gr (para pintarlo en la tecla)
const SIMBOLO_SHIFT = Object.fromEntries(Object.entries(SHIFT).filter(([s]) => s !== 'Ç').map(([s, k]) => [k, s]));
const SIMBOLO_ALTGR = Object.fromEntries(Object.entries(ALTGR).map(([s, k]) => [k, s]));

function shiftPara(tecla) {
  // Se usa la mayúscula de la mano contraria
  return MANO_IZQ.has(DEDO_DE[tecla]) ? '⇧ ' : '⇧';
}

// Qué teclas hay que pulsar para escribir un carácter (en orden).
export function teclasPara(ch) {
  if (ch === ' ') return [' '];
  if (DEDO_DE[ch] && ch.length === 1) return [ch];
  const low = ch.toLowerCase();
  if (ACENTO[ch]) return ['´', ACENTO[ch]];
  if (ACENTO_MAY[ch]) return ['´', shiftPara(ACENTO_MAY[ch]), ACENTO_MAY[ch]];
  if (DIERESIS[ch]) return ['⇧', '´', DIERESIS[ch]];
  if (GRAVE[ch]) return ['`', GRAVE[ch]];
  if (CIRCUNFLEJO[ch]) return ['⇧', '`', CIRCUNFLEJO[ch]];
  if (SHIFT[ch]) return [shiftPara(SHIFT[ch]), SHIFT[ch]];
  if (ALTGR[ch]) return ['Alt Gr', ALTGR[ch]];
  if (low !== ch && DEDO_DE[low]) return [shiftPara(low), low];
  return [];
}

export function crearTeclado(contenedor) {
  contenedor.classList.add('teclado');
  const porTecla = {};
  contenedor.innerHTML = '';
  for (const fila of FILAS) {
    const f = document.createElement('div');
    f.className = 'fila-t';
    for (const [k, d, ancho = 4] of fila) {
      const t = document.createElement('div');
      t.className = `tecla d-${d}`;
      t.style.gridColumn = `span ${ancho}`;
      t.textContent = k.trim().length === 1 ? k.toUpperCase() : k.trim();
      for (const [cls, mapa] of [['sup', SIMBOLO_SHIFT], ['alt', SIMBOLO_ALTGR]]) {
        if (!mapa[k]) continue;
        const s = document.createElement('span');
        s.className = cls; s.textContent = mapa[k];
        t.appendChild(s);
      }
      if (k === 'f' || k === 'j') t.classList.add('marca');
      if (k === ' ') t.textContent = '';
      f.appendChild(t);
      porTecla[k] = t;
    }
    contenedor.appendChild(f);
  }

  return {
    // Atenúa las teclas que aún no se han aprendido
    usadas(letras) {
      const set = new Set(letras.flatMap(teclasPara));
      for (const [k, el] of Object.entries(porTecla)) el.classList.toggle('usada', set.has(k) || !letras.length);
    },
    siguiente(ch) {
      for (const el of Object.values(porTecla)) el.classList.remove('siguiente');
      if (ch == null) return;
      for (const k of teclasPara(ch)) porTecla[k]?.classList.add('siguiente');
    },
    pulsar(ch) {
      for (const k of teclasPara(ch)) {
        const el = porTecla[k]; if (!el) continue;
        el.classList.add('pulsada');
        setTimeout(() => el.classList.remove('pulsada'), 120);
      }
    },
  };
}

// Leyenda de colores por dedo (los textos, en idiomas/*.js)
const DEDOS = [['#f6d6e0', 'menique'], ['#fde5c4', 'anular'], ['#d6f0d2', 'corazon'], ['#cfe3fb', 'indiceIzq'], ['#e2d7f7', 'indiceDer'], ['#e4e7ef', 'pulgar']];
export const leyendaDedos = () => DEDOS.map(([color, k]) => `<span style="--b:${color}">${t(`dedo.${k}`)}</span>`).join('');

// Catálogo de fichas y ejercicios. Para añadir una ficha nueva:
// se añade aquí, se crea su página y se ponen sus textos en idiomas/*.js
// (claves ficha.<id> y ej.<id>). La base de datos no cambia:
// cada intento se guarda con el id del ejercicio.
import { t, t1 } from './i18n.js';

// Niveles de mecanografía (teclado español). "nuevas" son las teclas
// que se practican en ese nivel; el nivel usa también las de antes.
// Su título y su ayuda están en idiomas/*.js (nivel.<n> y nivel.<n>.ayuda).
export const NIVELES = [
  { n: 1,  nuevas: 'fj' },
  { n: 2,  nuevas: 'dk' },
  { n: 3,  nuevas: 'sl' },
  { n: 4,  nuevas: 'añ' },
  { n: 5,  nuevas: 'gh' },
  { n: 6,  nuevas: 'ei' },
  { n: 7,  nuevas: 'ru' },
  { n: 8,  nuevas: 'toqwpy' },
  { n: 9,  nuevas: 'vmnbc' },
  { n: 10, nuevas: 'xz,.' },
  { n: 11, nuevas: '', frases: true },
  { n: 12, nuevas: '1234567890', practica: 'numeros', ayuda: true },
  { n: 13, nuevas: '!"$%&/()=?:;_', practica: 'shift', ayuda: true },
  { n: 14, nuevas: '@#€[]{}\\|', practica: 'altgr', ayuda: true },
];

export function letrasHasta(n) {
  return [...new Set(NIVELES.filter(l => l.n <= n).map(l => l.nuevas).join(''))];
}

export const FICHAS = [
  {
    id: 'meca', icono: '⌨️',
    pagina: 'mecanografia.html',
    ejercicios: [
      ...NIVELES.map(l => ({
        id: `meca-${l.n}`, nivel: l.n,
        unidad: 'ppm', menorMejor: false, clasifica: false,
      })),
      { id: 'meca-test', unidad: 'ppm', menorMejor: false, clasifica: true },
    ],
  },
  {
    id: 'raton', icono: '🖱️',
    pagina: 'raton.html',
    ejercicios: [
      { id: 'raton-clic', unidad: 's', menorMejor: true, clasifica: true },
      { id: 'raton-doble', unidad: 's', menorMejor: true, clasifica: true },
      { id: 'raton-derecho', unidad: 's', menorMejor: true, clasifica: true },
      { id: 'raton-arrastrar', unidad: 's', menorMejor: true, clasifica: true },
    ],
  },
  {
    id: 'archivos', icono: '📁',
    pagina: 'archivos.html',
    ejercicios: [
      { id: 'arch-carpeta', unidad: 's', menorMejor: true, clasifica: true },
      // Sin reloj: solo se guarda que la ha terminado (valor 1)
      { id: 'arch-archivos', unidad: 'hecho', menorMejor: false, clasifica: false },
      { id: 'arch-ordena', unidad: 's', menorMejor: true, clasifica: true },
      // Sesión 3, sin reloj
      { id: 'arch-web', unidad: 'hecho', menorMejor: false, clasifica: false },
    ],
  },
];

export const EJERCICIOS = Object.fromEntries(
  FICHAS.flatMap(f => f.ejercicios.map(e => [e.id, { ...e, ficha: f }])));

export const CLASIFICABLES = Object.values(EJERCICIOS).filter(e => e.clasifica);

// Columnas de la tabla de alumnos en Administración: récords y misiones terminadas
export const EN_ADMIN = Object.values(EJERCICIOS).filter(e => e.clasifica || e.unidad === 'hecho');

// Nombres en el idioma elegido
export const nombreFicha = f => t(`ficha.${f.id}`);
export const nombreNivel = n => `${t1('meca.nivel', { n })} · ${t(`nivel.${n}`)}`;
export const nombreEj = e => e.nivel ? nombreNivel(e.nivel) : t(`ej.${e.id}`);
export const nombreEj1 = e => e.nivel ? `${t1('meca.nivel', { n: e.nivel })} · ${t1(`nivel.${e.nivel}`)}` : t1(`ej.${e.id}`);

export function formatoValor(ej, valor) {
  if (valor == null) return '—';
  if (ej.unidad === 'hecho') return '✓';
  return ej.unidad === 's'
    ? `${Number(valor).toFixed(1).replace('.', ',')} s`
    : `${Math.round(valor)} ppm`;
}

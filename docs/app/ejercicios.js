// Catálogo de fichas y ejercicios. Para añadir una ficha nueva:
// se añade aquí y se crea su página. La base de datos no cambia:
// cada intento se guarda con el id del ejercicio.

// Niveles de mecanografía (teclado español). "teclas" son las letras
// que se practican en ese nivel; el nivel usa también las de antes.
export const NIVELES = [
  { n: 1,  nuevas: 'fj',      titulo: 'F, J y espacio' },
  { n: 2,  nuevas: 'dk',      titulo: 'D y K' },
  { n: 3,  nuevas: 'sl',      titulo: 'S y L' },
  { n: 4,  nuevas: 'añ',     titulo: 'A y Ñ' },
  { n: 5,  nuevas: 'gh',      titulo: 'G y H · fila central' },
  { n: 6,  nuevas: 'ei',      titulo: 'E e I' },
  { n: 7,  nuevas: 'ru',      titulo: 'R y U' },
  { n: 8,  nuevas: 'toqwpy',  titulo: 'Fila de arriba' },
  { n: 9,  nuevas: 'vmnbc',   titulo: 'V, M, N, B, C' },
  { n: 10, nuevas: 'xz,.',    titulo: 'Fila de abajo' },
  { n: 11, nuevas: '',        titulo: 'Mayúsculas y acentos', frases: true },
  { n: 12, nuevas: '1234567890', titulo: 'Números', practica: 'numeros',
    ayuda: 'Fila de los números: cada dedo sube desde su tecla. Les chiffres : chaque doigt monte depuis sa touche.' },
  { n: 13, nuevas: '!"$%&/()=?:;_', titulo: 'Símbolos con ⇧', practica: 'shift',
    ayuda: 'El símbolo de arriba de la tecla: mantén ⇧ con la otra mano. Le symbole du haut : garde ⇧ enfoncée avec l’autre main.' },
  { n: 14, nuevas: '@#€[]{}\\|', titulo: 'Símbolos con Alt Gr', practica: 'altgr',
    ayuda: 'El símbolo de abajo a la derecha: mantén Alt Gr (a la derecha del espacio) y pulsa la tecla. Le symbole en bas à droite : garde Alt Gr enfoncée.' },
];

export function letrasHasta(n) {
  return [...new Set(NIVELES.filter(l => l.n <= n).map(l => l.nuevas).join(''))];
}

export const FICHAS = [
  {
    id: 'meca', titulo: 'Mecanografía', fr: 'Dactylographie', icono: '⌨️',
    pagina: 'mecanografia.html',
    ejercicios: [
      ...NIVELES.map(l => ({
        id: `meca-${l.n}`, titulo: `Nivel ${l.n} · ${l.titulo}`,
        unidad: 'ppm', menorMejor: false, clasifica: false,
      })),
      { id: 'meca-test', titulo: 'Test de 1 minuto', fr: 'Test d’1 minute',
        unidad: 'ppm', menorMejor: false, clasifica: true },
    ],
  },
  {
    id: 'raton', titulo: 'Ratón', fr: 'Souris', icono: '🖱️',
    pagina: 'raton.html',
    ejercicios: [
      { id: 'raton-clic', titulo: 'Clic', fr: 'Clic', unidad: 's', menorMejor: true, clasifica: true },
      { id: 'raton-doble', titulo: 'Doble clic', fr: 'Double-clic', unidad: 's', menorMejor: true, clasifica: true },
      { id: 'raton-derecho', titulo: 'Clic derecho', fr: 'Clic droit', unidad: 's', menorMejor: true, clasifica: true },
      { id: 'raton-arrastrar', titulo: 'Arrastrar', fr: 'Glisser', unidad: 's', menorMejor: true, clasifica: true },
    ],
  },
  {
    id: 'archivos', titulo: 'Archivos y carpetas', fr: 'Fichiers et dossiers', icono: '📁',
    pagina: 'archivos.html',
    ejercicios: [
      { id: 'arch-carpeta', titulo: 'Crea tu carpeta', fr: 'Crée ton dossier', unidad: 's', menorMejor: true, clasifica: true },
    ],
  },
];

export const EJERCICIOS = Object.fromEntries(
  FICHAS.flatMap(f => f.ejercicios.map(e => [e.id, { ...e, ficha: f }])));

export const CLASIFICABLES = Object.values(EJERCICIOS).filter(e => e.clasifica);

export function formatoValor(ej, valor) {
  if (valor == null) return '—';
  return ej.unidad === 's'
    ? `${Number(valor).toFixed(1).replace('.', ',')} s`
    : `${Math.round(valor)} ppm`;
}

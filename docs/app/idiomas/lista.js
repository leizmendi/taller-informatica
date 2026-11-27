// Idiomas disponibles en la app, con su nombre en ese idioma.
//
// Para añadir uno nuevo:
//   1. Copia es.js con el código del idioma (por ejemplo, ca.js para catalán).
//   2. Traduce los textos de la derecha. No cambies las claves de la izquierda,
//      ni lo que va entre llaves ({n}, {apodo}…), ni las etiquetas HTML (<b>…</b>).
//      Los nombres de botones y menús de Windows (Archivo → Guardar como…) se
//      dejan en castellano, que es como salen en los ordenadores del taller,
//      y se puede añadir la traducción entre paréntesis.
//   3. Añade aquí una línea con el código y el nombre.
// Si falta algún texto, la app lo enseña en castellano.
// Los códigos son los de ISO 639 (dos letras o, si no hay, tres: snk).
// Si el idioma se escribe de derecha a izquierda, añádelo también a RTL.
export const IDIOMAS = {
  es: 'Castellano',
  fr: 'Français',
  eu: 'Euskara',
  en: 'English',
  ar: 'العربية',
  bm: 'Bamanankan',
  ff: 'Pulaar',
  // snk: 'Sooninkanxanne', // plantilla sin traducir (snk.js)
};

// Idiomas que se escriben de derecha a izquierda
export const RTL = new Set(['ar']);

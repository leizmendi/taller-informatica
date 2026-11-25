// Palabras y textos para mecanografía. Se pueden añadir más sin tocar nada más.

// Palabras sencillas en minúscula. Cada nivel usa solo las que se pueden
// escribir con las letras aprendidas hasta ese nivel.
export const PALABRAS = `
da la las sal ala alas falda faldas salsa dad sala salas fa ja jaja
hada hadas gala galas haga saga sagas hasta gafas gas daga dalla halla falla
añada caña sea fea fe le les el ella ellas de del es esa ese esas eses dedal
lee leed sede sefa aleja deja dejas hija hijas hielo fiel fila filas ida idea
ideas dije dile dime silla sillas lila lija aquel así ali fase fresa freír
risa ruido rueda rueda rifa río ríe rasa ruedas sur su sus usa uso usar duro
dura reír leer lees ser serie fuera fuerte fuego juego juegos jugar luego lugar
grupo grupos tu tus te toro todo todos otro otra otros tarde tarta tierra
puerta perro pera pato patos foto fotos plato platos pie pies papel pared
queso quiero quieres que yo ya hoy hay ayer playa leyes rey oye wifi
mano manos mesa mesas vaso vasos comer cama camas casa casas cine coche
cosa cosas clase clases nube nubes noche bien bueno buena barco libro
vida vamos ver vez vino vela verde nieve nombre mundo mucho mejor menos
amigo amigos amiga música número móvil ratón teclado pantalla correo
azul zumo zapato zapatos taza tazas luz voz pez feliz examen taxi texto
`.trim().split(/\s+/);

// Frases para el nivel de mayúsculas y acentos
export const FRASES = [
  'Hoy es lunes y hace sol.',
  'Mañana vamos a la piscina.',
  'Ana y José juegan al fútbol.',
  'El ratón está encima de la mesa.',
  '¿Dónde está mi móvil?',
  'La canción de Pablo es genial.',
  'En Navarra nieva en invierno.',
  'Mi número favorito es el siete.',
  'París y Madrid son ciudades grandes.',
  '¡Qué rápido escribes!',
];

// Niveles de números y símbolos: trozos de la vida real (correos, precios,
// porcentajes...). Solo minúsculas, para no mezclar con las mayúsculas.
export const PRACTICA = {
  numeros: [
    '12', '25', '100', '2026', '7 8 9', '1 2 3', '4 5 6', '0 0 7', 'aula 12', 'sala 3',
    'el 5 de mayo', '10 euros', '948 123 456', 'tengo 11', 'calle 15', 'piso 2', '365 días',
    '24 horas', '60 segundos', '1000', '50', '90', '38',
  ],
  shift: [
    '50%', '25%', '¡hola!', '¡ya!', '¿sí?', '¿qué?', '(casa)', '(1)', '3=3', '7=7', 'a/b', '2/3',
    '"hola"', '"sí"', 'tú & yo', 'yo & tú', '10$', '5$', 'uno; dos', 'hora: 10', 'mi_foto',
    'foto_1', 'nota: 9', '(2+3)', '¿vienes?', '¡bien!', 'precio: 20$', '100%',
  ],
  altgr: [
    'ana@correo.es', 'leo@gmail.com', 'mi@email.es', 'taller@aula.es', '#taller', '#hoy', '#2026',
    '20€', '5€', '1,50€', '[uno]', '[1]', '{dos}', '{a}', 'sol|luna', 'a|b', 'c:\\fotos',
    'd:\\juegos', '#clase', 'pepe@hotmail.com', '3€', '[ok]',
  ],
};

// Textos del test de 1 minuto
export const TEXTOS_TEST = [
  'El ordenador tiene una pantalla, un teclado y un ratón. Con el teclado escribimos letras y números. Con el ratón movemos la flecha y hacemos clic. Cada día practicamos un poco y cada día escribimos más rápido.',
  'Por la mañana desayuno pan con tomate y un vaso de leche. Después voy a clase con mis amigos. Por la tarde jugamos al fútbol en el campo del pueblo y luego hago los deberes en casa.',
  'Internet es una red muy grande que une ordenadores de todo el mundo. Sirve para buscar información, ver vídeos, escuchar música y hablar con otras personas. Hay que usarla con cuidado y no dar nunca nuestros datos.',
  'En otoño los árboles cambian de color. Las hojas se ponen amarillas y rojas y caen al suelo. Hace más frío, llueve a menudo y los días son más cortos. Es una buena época para pasear por el monte.',
  'Para escribir bien hay que mirar la pantalla y no el teclado. Los dedos índices descansan en la F y en la J, que tienen una pequeña marca. Desde ahí cada dedo se mueve a sus teclas y vuelve a su sitio.',
  'Mi plato favorito es la tortilla de patatas. Se hace con huevos, patatas, aceite y sal. Algunas personas le ponen cebolla y otras no. Cada familia tiene su receta y todas dicen que la suya es la mejor.',
];

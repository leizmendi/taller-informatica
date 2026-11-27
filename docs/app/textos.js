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

// Textos del test de 1 minuto, por idioma. Sale el del idioma principal
// y, si no hay, el castellano. Cada test junta 3 textos al azar.
// Solo valen caracteres que se pueden escribir con el teclado español del
// taller: por eso no hay textos en árabe, bambara (ɛ, ɔ, ɲ…) ni fula (ɓ, ɗ…).
// En francés se pueden usar é, è, à, ù, ê, â, î, ô, û, ç y ë (con ´, `, ^ y ¨),
// pero no œ ni comillas « » ni el apóstrofo curvo ’ (usa ').
export const TEXTOS_TEST = {
  es: [
  'El ordenador tiene una pantalla, un teclado y un ratón. Con el teclado escribimos letras y números. Con el ratón movemos la flecha y hacemos clic. Cada día practicamos un poco y cada día escribimos más rápido.',
  'Por la mañana desayuno pan con tomate y un vaso de leche. Después voy a clase con mis amigos. Por la tarde jugamos al fútbol en el campo del pueblo y luego hago los deberes en casa.',
  'Internet es una red muy grande que une ordenadores de todo el mundo. Sirve para buscar información, ver vídeos, escuchar música y hablar con otras personas. Hay que usarla con cuidado y no dar nunca nuestros datos.',
  'En otoño los árboles cambian de color. Las hojas se ponen amarillas y rojas y caen al suelo. Hace más frío, llueve a menudo y los días son más cortos. Es una buena época para pasear por el monte.',
  'Para escribir bien hay que mirar la pantalla y no el teclado. Los dedos índices descansan en la F y en la J, que tienen una pequeña marca. Desde ahí cada dedo se mueve a sus teclas y vuelve a su sitio.',
  'Mi plato favorito es la tortilla de patatas. Se hace con huevos, patatas, aceite y sal. Algunas personas le ponen cebolla y otras no. Cada familia tiene su receta y todas dicen que la suya es la mejor.',
  ],
  fr: [
    "L'ordinateur a un écran, un clavier et une souris. Avec le clavier, on écrit des lettres et des chiffres. Avec la souris, on bouge la flèche et on clique. Chaque jour on s'entraîne un peu et on écrit plus vite.",
    "Le matin, je mange du pain et je bois un verre de lait. Après, je vais en classe avec mes amis. L'après-midi, on joue au foot sur le terrain du quartier et ensuite je fais mes devoirs à la maison.",
    "Internet est un très grand réseau qui relie des ordinateurs du monde entier. Il sert à chercher des informations, regarder des vidéos, écouter de la musique et parler avec d'autres personnes. Il faut faire attention et ne jamais donner ses données.",
    "En automne, les arbres changent de couleur. Les feuilles deviennent jaunes et rouges et tombent par terre. Il fait plus froid, il pleut souvent et les jours sont plus courts. C'est une bonne saison pour se promener.",
    "Pour bien écrire, il faut regarder l'écran et pas le clavier. Les index se posent sur le F et sur le J, qui ont une petite marque. De là, chaque doigt va vers ses touches et revient à sa place.",
    "Mon plat préféré, c'est le riz avec du poisson. On le prépare avec des légumes, de l'huile, du sel et un peu de piment. Chaque famille a sa recette et chacun dit que la sienne est la meilleure.",
  ],
  eu: [
    "Ordenagailuak pantaila, teklatua eta sagua ditu. Teklatuarekin letrak eta zenbakiak idazten ditugu. Saguarekin gezia mugitzen dugu eta klik egiten dugu. Egunero pixka bat praktikatzen dugu eta egunero azkarrago idazten dugu.",
    "Goizean ogia jaten dut eta esne baso bat edaten dut. Gero lagunekin klasera joaten naiz. Arratsaldean futbolean jokatzen dugu herriko zelaian eta gero etxeko lanak egiten ditut etxean.",
    "Internet sare oso handia da, mundu osoko ordenagailuak lotzen dituena. Informazioa bilatzeko, bideoak ikusteko, musika entzuteko eta beste pertsona batzuekin hitz egiteko balio du. Kontuz erabili behar da eta ez dugu inoiz gure daturik eman behar.",
    "Udazkenean zuhaitzek kolorea aldatzen dute. Hostoak horiak eta gorriak jartzen dira eta lurrera erortzen dira. Hotz gehiago egiten du, askotan euria egiten du eta egunak laburragoak dira. Mendian ibiltzeko garai ona da.",
    "Ondo idazteko pantailari begiratu behar zaio, ez teklatuari. Hatz erakusleak F eta J teklen gainean daude, marka txiki bat dutelako. Hortik hatz bakoitza bere tekletara mugitzen da eta bere lekura itzultzen da.",
    "Nire janari gogokoena patata tortilla da. Arrautzekin, patatekin, olioarekin eta gatzarekin egiten da. Batzuek tipula jartzen diote eta beste batzuek ez. Familia bakoitzak bere errezeta du eta denek diote berea dela onena.",
  ],
  en: [
    "The computer has a screen, a keyboard and a mouse. With the keyboard we write letters and numbers. With the mouse we move the arrow and click. Every day we practise a little and every day we type faster.",
    "In the morning I have bread and a glass of milk for breakfast. Then I go to class with my friends. In the afternoon we play football on the town pitch and after that I do my homework at home.",
    "The Internet is a very big network that connects computers all over the world. We use it to look for information, watch videos, listen to music and talk to other people. We have to use it carefully and never give away our personal data.",
    "In autumn the trees change colour. The leaves turn yellow and red and fall to the ground. It gets colder, it often rains and the days are shorter. It is a good time to go for a walk in the hills.",
    "To type well you have to look at the screen and not at the keyboard. Your index fingers rest on F and J, which have a small mark. From there each finger moves to its keys and goes back to its place.",
    "My favourite dish is rice with chicken. You make it with vegetables, oil, salt and a little spice. Some people add onion and others do not. Every family has its own recipe and they all say theirs is the best.",
  ],
};

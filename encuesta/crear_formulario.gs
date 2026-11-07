/**
 * Crea en Google Forms la "Encuesta inicial – Taller de informática".
 *
 * Uso:
 *   1. Entra en https://script.google.com con tu cuenta y pulsa "Nuevo proyecto".
 *   2. Borra lo que haya, pega este archivo entero y guarda.
 *   3. Con la función crearFormulario seleccionada, pulsa "Ejecutar" y acepta los permisos.
 *   4. Abre "Registro de ejecución": ahí salen los enlaces del formulario y de las respuestas.
 *
 * Ejecútalo una sola vez: cada ejecución crea un formulario y una hoja nuevos.
 */

var IMG = 'https://fonts.gstatic.com/s/e/notoemoji/latest/';

// Columnas de las cuadrículas
var SI_POCO_NO = ['Sí / Oui', 'Un poco / Un peu', 'No / Non'];
var FRECUENCIA = ['Nunca / Jamais', 'Pocas veces / Parfois', 'Muchas veces / Souvent'];
var CONOCE = [
  'No lo conozco / Je ne connais pas',
  'He oído hablar / J\'en ai entendu parler',
  'Lo he usado / Je l\'ai utilisé'
];
var LECTURA = ['Bien / Bien', 'Un poco / Un peu', 'Todavía no / Pas encore'];
var SOLO = '¿Sabes hacer esto solo? / Sais-tu faire ça tout seul ?';

// Tipos: corta = respuesta corta, una = opción múltiple,
// varias = casillas de verificación, cuadricula = cuadrícula de opción múltiple
var SECCIONES = [
  {
    titulo: '1. Sobre ti / Sur toi',
    preguntas: [
      {
        tipo: 'varias', img: '1f5e3_fe0f', otro: true,
        titulo: '1. ¿Qué idiomas hablas? / Quelles langues parles-tu ?',
        opciones: ['Bambara', 'Soninké', 'Fula / Peul', 'Francés / Français', 'Árabe / Arabe',
          'Inglés / Anglais', 'Castellano / Espagnol']
      },
      {
        tipo: 'una', img: '1f1ea_1f1f8',
        titulo: '2. ¿Cómo lees en castellano? / Tu lis l\'espagnol comment ?',
        opciones: LECTURA
      },
      {
        tipo: 'una', img: '1f1eb_1f1f7',
        titulo: '3. ¿Cómo lees en francés? / Tu lis le français comment ?',
        opciones: LECTURA
      },
      {
        tipo: 'una', img: '1f4bb',
        titulo: '4. ¿Has usado un ordenador en tu país? / As-tu utilisé un ordinateur dans ton pays ?',
        opciones: ['Sí / Oui', 'No / Non']
      }
    ]
  },
  {
    titulo: '2. Aparatos / Appareils',
    preguntas: [
      {
        tipo: 'una', img: '1f4f1',
        titulo: '5. ¿Tienes móvil? / As-tu un téléphone ?',
        opciones: ['Sí, smartphone (Android) / Oui, smartphone (Android)',
          'Sí, smartphone (iPhone) / Oui, smartphone (iPhone)',
          'Sí, móvil sencillo / Oui, téléphone simple',
          'No / Non']
      },
      {
        tipo: 'cuadricula', img: '1f5a5_fe0f',
        titulo: '6. ¿Has usado alguna vez…? / As-tu déjà utilisé… ?',
        filas: ['Ordenador de mesa / Ordinateur de bureau', 'Portátil / Ordinateur portable',
          'Tablet / Tablette', 'Impresora / Imprimante'],
        columnas: FRECUENCIA
      }
    ]
  },
  {
    titulo: '3. Ordenador y Windows / Ordinateur et Windows',
    preguntas: [
      {
        tipo: 'cuadricula', img: '1f5b1_fe0f',
        titulo: '7. ' + SOLO,
        filas: ['Encender y apagar el ordenador / Allumer et éteindre',
          'Usar el ratón (clic, doble clic) / Utiliser la souris',
          'Escribir con el teclado / Écrire avec le clavier',
          'Poner mayúsculas, acentos, @ / Majuscules, accents, @',
          'Abrir un programa / Ouvrir un programme',
          'Guardar un archivo y encontrarlo / Enregistrer et retrouver un fichier',
          'Usar un pendrive / Utiliser une clé USB',
          'Escribir un texto en Word / Écrire un texte dans Word',
          'Imprimir / Imprimer'],
        columnas: SI_POCO_NO
      }
    ]
  },
  {
    titulo: '4. Internet / Internet',
    preguntas: [
      {
        tipo: 'cuadricula', img: '1f310',
        titulo: '8. ' + SOLO,
        filas: ['Conectarte a una wifi / Se connecter au wifi',
          'Buscar algo en Google / Chercher sur Google',
          'Ver vídeos en YouTube / Regarder YouTube',
          'Usar un traductor (Google Translate) / Utiliser un traducteur',
          'Saber si una página o un mensaje es falso / Savoir si un message est faux'],
        columnas: SI_POCO_NO
      }
    ]
  },
  {
    titulo: '5. Correo y mensajes / E-mail et messages',
    preguntas: [
      {
        tipo: 'una', img: '1f4e7',
        titulo: '9. ¿Tienes correo electrónico (Gmail u otro)? / As-tu une adresse e-mail ?',
        opciones: ['Sí, y sé entrar solo / Oui, et je sais me connecter seul',
          'Sí, pero no sé entrar / no recuerdo la contraseña / Oui, mais je ne sais pas me connecter / j\'ai oublié le mot de passe',
          'No / Non',
          'No sé qué es / Je ne sais pas ce que c\'est']
      },
      {
        tipo: 'cuadricula', img: '1f4ac',
        titulo: '10. ' + SOLO,
        filas: ['Enviar un correo / Envoyer un e-mail',
          'Adjuntar una foto o un documento / Joindre une photo ou un document',
          'Usar WhatsApp / Utiliser WhatsApp',
          'Hacer videollamadas / Faire des appels vidéo'],
        columnas: SI_POCO_NO
      },
      {
        tipo: 'varias', img: '1f4f2', otro: true,
        titulo: '11. ¿Qué apps usas más en el móvil? / Quelles applis utilises-tu le plus ?',
        opciones: ['WhatsApp', 'TikTok', 'YouTube', 'Instagram', 'Facebook', 'Snapchat', 'Juegos / Jeux']
      }
    ]
  },
  {
    titulo: '6. Inteligencia artificial / Intelligence artificielle',
    preguntas: [
      {
        tipo: 'cuadricula', img: '1f916',
        titulo: '12. ¿Conoces estas herramientas? / Connais-tu ces outils ?',
        filas: ['ChatGPT', 'Claude', 'Gemini / Meta AI (en WhatsApp)'],
        columnas: CONOCE
      },
      {
        tipo: 'varias', img: '1f4a1', otro: true,
        titulo: '13. Si lo has usado, ¿para qué? / Si oui, pour quoi faire ?',
        opciones: ['Traducir / Traduire', 'Deberes, clase de castellano / Devoirs',
          'Preguntas / Questions', 'Por diversión / Pour s\'amuser']
      }
    ]
  },
  {
    titulo: '7. ¿Qué quieres aprender? / Qu\'est-ce que tu veux apprendre ?',
    preguntas: [
      {
        tipo: 'varias', img: '1f3af', otro: true,
        titulo: '14. Marca lo que más te interesa (puedes marcar varios) / Coche ce qui t\'intéresse le plus',
        opciones: ['Escribir mejor en el ordenador / Taper sur le clavier',
          'Aprender castellano con el ordenador / Apprendre l\'espagnol',
          'Hacer un currículum y buscar trabajo / Faire un CV, chercher du travail',
          'Trámites por internet (cita, formularios) / Démarches en ligne',
          'Correo electrónico / E-mail',
          'Usar la IA para aprender y traducir / Utiliser l\'IA pour apprendre',
          'Seguridad: contraseñas, estafas, privacidad / Sécurité, arnaques',
          'Hacer vídeos, fotos, música / Vidéos, photos, musique',
          'Programar, crear juegos o páginas web / Programmer, créer des jeux']
      },
      {
        tipo: 'corta', img: '1f4bc',
        titulo: '15. ¿Qué trabajo te gustaría tener en el futuro? / Quel métier aimerais-tu faire plus tard ?'
      }
    ]
  }
];

function crearFormulario() {
  var titulo = 'Taller de informática – ¿Qué sabes ya? / Atelier d\'informatique – Qu\'est-ce que tu sais déjà ?';
  var form = FormApp.create(titulo);

  form.setDescription('No es un examen. Marca tu respuesta.\nCe n\'est pas un examen. Coche ta réponse.')
    .setCollectEmail(false)
    .setLimitOneResponsePerUser(false)
    .setShowLinkToRespondAgain(true)   // ordenadores compartidos: el siguiente puede responder
    .setProgressBar(true)
    .setConfirmationMessage('¡Gracias! / Merci !');

  var fallos = [];

  // Portada: solo el nombre o apodo, sin datos personales
  anadirImagen(form, '1f464', fallos);
  form.addTextItem()
    .setTitle('Nombre o apodo / Prénom ou surnom')
    .setHelpText('Sin apellidos. / Sans nom de famille.')
    .setRequired(false);

  SECCIONES.forEach(function (seccion) {
    form.addPageBreakItem().setTitle(seccion.titulo);
    seccion.preguntas.forEach(function (p) {
      anadirImagen(form, p.img, fallos);
      anadirPregunta(form, p);
    });
  });

  // Hoja de cálculo donde se vuelcan las respuestas
  var hoja = SpreadsheetApp.create('Respuestas – Encuesta inicial Taller de informática');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());

  // Google deja sin publicar algunos formularios creados por script
  try {
    form.setPublished(true);
  } catch (e) {
    Logger.log('AVISO: no se pudo publicar por script. Pulsa "Publicar" en el editor del formulario.');
  }

  Logger.log('Editar el formulario: ' + form.getEditUrl());
  Logger.log('Enlace para los chavales: ' + form.getPublishedUrl());
  Logger.log('Hoja de respuestas: ' + hoja.getUrl());
  if (fallos.length) {
    Logger.log('AVISO: no se pudieron cargar estas imágenes: ' + fallos.join(', '));
  }
}

function anadirPregunta(form, p) {
  var item;
  if (p.tipo === 'corta') {
    item = form.addTextItem();
  } else if (p.tipo === 'una') {
    item = form.addMultipleChoiceItem().setChoiceValues(p.opciones);
  } else if (p.tipo === 'varias') {
    item = form.addCheckboxItem().setChoiceValues(p.opciones).showOtherOption(p.otro === true);
  } else if (p.tipo === 'cuadricula') {
    item = form.addGridItem().setRows(p.filas).setColumns(p.columnas);
  } else {
    throw new Error('Tipo de pregunta desconocido: ' + p.tipo);
  }
  // Nada obligatorio: si hay cansancio, las últimas secciones pueden quedarse para otro día
  item.setTitle(p.titulo).setRequired(false);
}

// Una imagen que falle no debe impedir que se cree el formulario
function anadirImagen(form, codigo, fallos) {
  try {
    var imagen = UrlFetchApp.fetch(IMG + codigo + '/512.png').getBlob();
    form.addImageItem().setImage(imagen).setAlignment(FormApp.Alignment.CENTER).setWidth(120);
  } catch (e) {
    fallos.push(codigo);
  }
}

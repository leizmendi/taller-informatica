# Taller de informática

Materiales de un taller de informática para chavales recién llegados, con clases semanales de 90 minutos. Todo está pensado para un grupo con niveles muy distintos que habla castellano y francés: las fichas y la encuesta son bilingües y llevan iconos y poco texto.

**Índice para proyectar a los chavales:** https://leizmendi.github.io/taller-informatica/

## Qué hay

| Carpeta | Contenido |
| --- | --- |
| [`programa/`](programa/programa.md) | El programa del trimestre: 12 sesiones con objetivos y actividades, calendario y ajustes según la encuesta |
| [`encuesta/`](encuesta/) | Script de Google Apps Script que crea la encuesta inicial en Google Forms, y la imagen de cabecera |
| [`plantilla_web/`](plantilla_web/index.html) | Plantilla "Mi primera web" para las sesiones 11 y 12. Solo hay que cambiar las partes marcadas `CAMBIA` |
| [`docs/`](docs/index.html) | El índice del programa que publica GitHub Pages |
| [`fichas/`](fichas/) | Las fichas de cada sesión (en preparación) |

## Cómo crear la encuesta

1. Entra en https://script.google.com y pulsa "Nuevo proyecto".
2. Pega el contenido de [`encuesta/crear_formulario.gs`](encuesta/crear_formulario.gs) y guarda.
3. Ejecuta la función `crearFormulario` y acepta los permisos.
4. En el "Registro de ejecución" aparecen el enlace del formulario y el de la hoja de respuestas.

Cada ejecución crea un formulario nuevo, así que basta con ejecutarlo una vez.

## Privacidad

Este repositorio es público. **No se suben aquí** respuestas de la encuesta, nombres ni apodos reales, fotos de los chavales ni el nombre del centro. Las respuestas se quedan en la hoja de Google del monitor.

## Licencia

Los materiales se publican con licencia [Creative Commons Atribución-CompartirIgual 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es) (CC BY-SA 4.0). Puedes usarlos y adaptarlos citando la fuente y compartiendo los cambios con la misma licencia.

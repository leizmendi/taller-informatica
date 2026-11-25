# Taller de informática

Materiales de un taller de informática para chavales recién llegados, con clases semanales de 90 minutos. Todo está pensado para un grupo con niveles muy distintos que habla castellano y francés: las fichas y la encuesta son bilingües y llevan iconos y poco texto.

**Índice para proyectar a los chavales:** https://leizmendi.github.io/taller-informatica/

**Fichas de cada sesión:** https://leizmendi.github.io/taller-informatica/fichas/

## Qué hay

| Carpeta | Contenido |
| --- | --- |
| [`programa/`](programa/programa.md) | El programa del trimestre: 12 sesiones con objetivos y actividades, calendario y ajustes según la encuesta |
| [`Encuesta inicial – Taller de informática.pdf`](<Encuesta inicial – Taller de informática.pdf>) | La encuesta inicial en PDF: notas para el monitor, la versión para imprimir (páginas 2 a 4) y cómo usar los resultados |
| [`encuesta/`](encuesta/) | Script de Google Apps Script que crea la encuesta inicial en Google Forms, y la imagen de cabecera |
| [`plantilla_web/`](plantilla_web/index.html) | Plantilla "Mi primera web" para las sesiones 11 y 12. Solo hay que cambiar las partes marcadas `CAMBIA` |
| [`docs/`](docs/index.html) | Lo que publica GitHub Pages: el índice del programa |
| [`docs/fichas/`](docs/fichas/) | Las fichas de cada sesión (guía del monitor, fichas para imprimir y juegos). Desde el navegador se imprimen con el botón "Imprimir" |

## App del taller (`docs/app/`)

Cada alumno entra con usuario y contraseña y tiene sus fichas con pruebas cronometradas: mecanografía (14 niveles, de F‑J‑espacio a mayúsculas y acentos, números y símbolos como % & @ # €, más un test de 1 minuto) y ratón (clic, doble clic, clic derecho y arrastrar). Las marcas se guardan y hay clasificación por curso. El monitor crea cursos y cuentas desde **Administración**.

Se publica con GitHub Pages en https://leizmendi.github.io/taller-informatica/app/ y guarda los datos en Supabase.

**Puesta en marcha (una vez):**

1. En Supabase → SQL Editor, pega y ejecuta [`docs/app/supabase.sql`](docs/app/supabase.sql).
2. Authentication → Users → Add user → Create new user: tu correo y contraseña, con "Auto Confirm User".
3. En el SQL Editor, hazte monitor:
   ```sql
   update public.perfiles set rol = 'admin', apodo = 'Monitor'
   where id = (select id from auth.users where email = 'TU@CORREO');
   ```
4. Authentication → Sign In / Providers: desactiva "Allow new users to sign up".
5. Entra en la app con tu correo, ve a Administración, crea el curso y los alumnos e imprime sus tarjetas.

**Más monitores:** créale una cuenta desde Administración (mejor sin curso) y pulsa **Hacer monitor** en su fila. Verá y gestionará todos los cursos. Con **Quitar monitor** vuelve a ser alumno; nadie puede quitarse el papel a sí mismo.

**Añadir una ficha nueva:** se declara en [`docs/app/ejercicios.js`](docs/app/ejercicios.js), se crea su página y se guardan los resultados con `guardarIntento()`. La base de datos no cambia.

La clave de `config.js` es pública por diseño; los datos los protegen las reglas de `supabase.sql`. Los alumnos se dan de alta con un apodo, nunca con su nombre real.

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

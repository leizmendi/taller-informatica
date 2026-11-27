// Misión 4 (sesión 3): "Una web por dentro". Escriben hola.html con el Bloc de notas,
// lo guardan en Web, lo abren con doble clic (se abre en el navegador), ven el código
// con "Abrir con → Bloc de notas", lo cambian y recargan con F5. Sin reloj.
// La app comprueba el archivo y enseña su página.
// Textos: claves m4.*, prog.*, arch.* y comun.* de idiomas/*.js
import { guardarIntento, sonar, celebrar, esc } from './comun.js';
import { t, t1 } from './i18n.js';
import { SUBCARPETAS, nombreCarpeta, norm, puedeLeerCarpetas, avisoNavegador, contenido, leerMiCarpeta } from './archivos-comun.js';

const EJ = 'arch-web';

export function montar({ perfil, records, caja, marcadorEl }) {
  const NOMBRE = nombreCarpeta(perfil);
  const carpeta = esc(NOMBRE);
  const TITULO = `<h2>${t('m4.titulo')}</h2>`;
  const q = sel => caja.querySelector(sel);
  let vivo = true;
  const respondidas = new Set();
  let fallosPreguntas = 0;

  const VER = [['codigo', t('m4.verCodigo')], ['pagina', t('m4.verPagina')]];
  const PREGUNTAS = [
    { id: 'w1', texto: t('m4.p1'), bien: ['nav'], pista: t('m4.p1pista'),
      opciones: [['bloc', '📝 ' + t('prog.bloc')], ['nav', '🌐 ' + t('prog.navegadorEdge')], ['fotos', '🖼️ ' + t('prog.fotos')]] },
    { id: 'w2', texto: t('m4.p2'), opciones: VER, bien: ['pagina'], pista: t('m4.p2pista') },
    { id: 'w3', texto: t('m4.p3'), opciones: VER, bien: ['codigo'], pista: t('m4.p3pista') },
  ];

  const hecha = `<span>✅ ${t('comun.yaHecha')}</span>`;
  marcadorEl.innerHTML = records[EJ] != null ? hecha : '';
  if (!puedeLeerCarpetas()) { caja.innerHTML = TITULO + avisoNavegador(); return () => {}; }

  // El código se queda en castellano: es lo que copian en el Bloc de notas
  const codigo = `&lt;meta charset="utf-8"&gt;
&lt;h1&gt;Hola, soy ${esc(perfil.apodo)}&lt;/h1&gt;
&lt;p&gt;Me gusta …&lt;/p&gt;`;

  const casilla = html => `<li><label><input type="checkbox"> ${html}</label></li>`;
  const cajaPregunta = p => `<div class="pregunta" data-id="${p.id}">
      <p>${p.texto}</p>
      <div class="opciones">${p.opciones.map(([v, x]) => `<button class="ghost" data-v="${v}">${x}</button>`).join('')}</div>
      <p class="pista"></p>
    </div>`;

  caja.innerHTML = `${TITULO}
    <p>${t('m4.intro')}</p>

    <h3>1 · ${t('m4.h1')}</h3>
    <ul class="checklist">
      ${casilla(t('m2.bloc1'))}
      <li><label><input type="checkbox"> ${t('m4.copia')}</label>
        <pre class="codigo">${codigo}</pre>
        <p class="muted">${t1('m4.teclas')}</p></li>
    </ul>

    <h3>2 · ${t('m4.h2')}</h3>
    <ul class="checklist">
      ${casilla(t('m4.guarda1', { carpeta }))}
      ${casilla(t('m4.guarda2'))}
      ${casilla(t('m4.guarda3'))}
    </ul>

    <h3>3 · ${t('m4.h3')}</h3>
    <p>${t('m4.entraWeb')}</p>
    ${PREGUNTAS.map(cajaPregunta).join('')}

    <h3>4 · ${t('m4.h4')}</h3>
    <ul class="checklist">
      <li><label><input type="checkbox"> ${t('m4.cambia1')}</label>
        <pre class="codigo">&lt;p&gt;Mi comida favorita es …&lt;/p&gt;</pre></li>
      ${casilla(t('m4.cambia2'))}
      ${casilla(t('m4.cambia3'))}
    </ul>

    <h3>5 · ${t('comun.comprobar')}</h3>
    <p>${t('arch.comoComprobar', { carpeta: `<span class="nombre">${carpeta}</span>` })}</p>
    <div class="fila"><button id="btn-comprobar" class="grande">🔍 ${t('comun.comprobar')}</button></div>
    <div id="revision"></div>`;

  for (const div of caja.querySelectorAll('.pregunta')) {
    const p = PREGUNTAS.find(x => x.id === div.dataset.id);
    div.querySelector('.opciones').onclick = e => {
      const b = e.target.closest('button'); if (!b || respondidas.has(p.id)) return;
      if (p.bien.includes(b.dataset.v)) {
        respondidas.add(p.id);
        b.classList.remove('ghost'); b.classList.add('acierto');
        div.querySelectorAll('button').forEach(x => { x.disabled = x !== b; });
        div.querySelector('.pista').innerHTML = '✅ ' + t(p.id === 'w3' ? 'm4.p3bien' : 'comun.bien');
        sonar('ok');
      } else {
        fallosPreguntas++;
        b.disabled = true;
        div.querySelector('.pista').innerHTML = '🤔 ' + p.pista;
        sonar('fallo');
      }
    };
  }

  const mostrar = html => { if (vivo && q('#revision')) q('#revision').innerHTML = html; };
  q('#btn-comprobar').onclick = comprobar;

  // Busca hola.html en su carpeta y subcarpetas (un nivel) y revisa lo que tiene dentro.
  async function comprobar() {
    const r = await leerMiCarpeta(perfil);
    if (!r || !vivo) return;
    if (r.error) { sonar('fallo'); return mostrar(r.error); }
    const { dentro } = r;
    const entradas = dentro.filter(h => h.kind === 'file').map(h => ({ h, donde: '' }));
    let hayWeb = false;
    for (const c of SUBCARPETAS) {
      const sub = dentro.find(h => h.kind === 'directory' && norm(h.name) === norm(c));
      if (!sub) continue;
      if (c === 'Web') hayWeb = true;
      try { for (const h of await contenido(sub)) if (h.kind === 'file') entradas.push({ h, donde: c }); } catch { }
    }
    if (!vivo) return;
    const error = html => { sonar('fallo'); mostrar(`<p>${t('comun.aunNo')}</p><ul class="revision"><li>${html}</li></ul>
      <p class="muted">${t('comun.arreglalo')}</p>`); };

    if (!hayWeb) return error(t('m4.faltaWeb'));
    const nombreDe = e => e.h.name.toLowerCase();
    const buenos = entradas.filter(e => /^hola\.html?$/.test(nombreDe(e)));
    if (!buenos.length) {
      const txt = entradas.find(e => /^hola\.html?\.txt$/.test(nombreDe(e)));
      if (txt) return error(t('m4.conTxt', { nombre: esc(txt.h.name) }));
      const otro = entradas.find(e => nombreDe(e).startsWith('hola'));
      if (otro) return error(t('m4.otroNombre', { nombre: esc(otro.h.name) }));
      return error(t('m4.noEsta'));
    }
    if (buenos.length > 1) return error(t('m4.dosSitios'));
    const { h, donde } = buenos[0];
    if (donde !== 'Web') return error(t('m4.malSitio', { donde: donde || carpeta }));

    let texto;
    try { texto = await (await h.getFile()).text(); } catch { return error(t('m4.noLeer')); }
    if (!vivo) return;
    const bajo = texto.toLowerCase();
    const avisos = [];
    if (!/<h1>[\s\S]*<\/h1>/.test(bajo)) avisos.push(t('m4.sinH1'));
    const parrafos = (bajo.match(/<p>[\s\S]*?<\/p>/g) || []).length;
    if (parrafos === 0) avisos.push(t('m4.sinP'));
    else if (parrafos === 1) avisos.push(t('m4.unaP'));
    if (!bajo.includes('charset')) avisos.push(t('m4.sinCharset'));
    if (texto.includes('�')) avisos.push(t('m4.noUtf8'));
    if (avisos.length) {
      sonar('fallo');
      return mostrar(`<p>${t('m4.leFalta')}</p>
        <ul class="revision">${avisos.map(a => `<li>${a}</li>`).join('')}</ul>
        <p class="muted">${t('m4.arreglalo')}</p>`);
    }
    if (respondidas.size < PREGUNTAS.length) {
      sonar('fallo');
      return mostrar(`<p>${t('m4.faltanPreguntas')}</p>`);
    }
    terminar(texto);
  }

  async function terminar(texto) {
    sonar('ok'); celebrar();
    caja.innerHTML = `<h2>${t('comun.cumplida')}</h2>
      <p>${t('m4.tuPagina')}</p>
      <iframe class="mi-web" sandbox title="${esc(t1('m4.tuPaginaTitulo'))}"></iframe>
      <details><summary>${t('m4.verElCodigo')}</summary><pre class="codigo">${esc(texto.slice(0, 4000))}</pre></details>
      <p class="muted" id="guardado">${t('comun.guardando')}</p>`;
    q('.mi-web').srcdoc = texto; // sandbox sin permisos: no ejecuta nada
    const ok = await guardarIntento({
      ejercicio: EJ, valor: 1, errores: fallosPreguntas,
      acierto: Math.round(PREGUNTAS.length / (PREGUNTAS.length + fallosPreguntas) * 1000) / 10,
    });
    if (!vivo || !q('#guardado')) return;
    q('#guardado').innerHTML = ok ? '✓ ' + t('comun.guardado') : t('comun.noGuardado');
    if (ok) { records[EJ] = 1; marcadorEl.innerHTML = hecha; }
  }

  return () => { vivo = false; };
}

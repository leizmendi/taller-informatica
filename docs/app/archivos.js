// Archivos y carpetas: tres pruebas en una página.
//  1. Crea tu carpeta (cronometrada, se hace en el Explorador de Windows y la app la comprueba)
//  2. Mis archivos (sin reloj: Bloc de notas, Paint, doble clic y ordenar)
//  3. Ordena los archivos (cronometrada, se arrastra dentro de la app)
import { exigirSesion, misMejores, calcularRecords } from './comun.js';
import { EJERCICIOS } from './ejercicios.js';
import * as carpeta from './mision-carpeta.js';
import * as misArchivos from './mision-archivos.js';
import * as ordena from './ordena.js';

const $ = id => document.getElementById(id);
const perfil = await exigirSesion();
const records = calcularRecords(await misMejores());

const MODOS = { 'arch-carpeta': carpeta, 'arch-archivos': misArchivos, 'arch-ordena': ordena };
let modo = MODOS[location.hash.slice(1)] ? location.hash.slice(1) : 'arch-carpeta';
let salir = null;

function elegir(id) {
  salir?.();
  modo = id;
  history.replaceState(null, '', '#' + id);
  $('modos').innerHTML = Object.keys(MODOS).map((m, i) =>
    `<button data-id="${m}" class="${m === modo ? 'elegido' : 'ghost'}">${i + 1} · ${EJERCICIOS[m].titulo} · <span class="fr">${EJERCICIOS[m].fr}</span></button>`).join('');
  salir = MODOS[id].montar({ perfil, records, caja: $('mision'), marcadorEl: $('marcador') });
}

$('modos').onclick = e => {
  const b = e.target.closest('button');
  if (b && b.dataset.id !== modo) elegir(b.dataset.id);
};

elegir(modo);

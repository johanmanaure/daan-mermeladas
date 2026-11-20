/* ==========================================================
   UTILIDADES: atajos que usan todos los demás archivos
   ========================================================== */

// Atajos para buscar elementos
const $  = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Da formato de pesos: 18000 -> $18.000
function dinero(numero) {
  return '$' + numero.toLocaleString('es-CO');
}

// Muestra un aviso breve abajo de la pantalla
function mostrarAviso(texto) {
  const aviso = $('#aviso');
  aviso.textContent = texto;
  aviso.classList.add('visible');
  setTimeout(() => aviso.classList.remove('visible'), 1800);
}

// Dólares y pesos: 10.99 -> US$ 10,99 · y debajo (COP $36.600), según la TRM de datos.js
const usd = (n) => 'US$ ' + n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const cop = (n) => '(COP $' + (Math.round(n * TRM / 100) * 100).toLocaleString('de-DE') + ')';
const precioLinea = (n) => usd(n) + ' ' + cop(n);
const precioHTML = (n) => `<span class="usd">${usd(n)}</span><small class="cop">${cop(n)}</small>`;

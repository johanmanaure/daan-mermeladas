/* ==========================================================
   PEDIDO: presentación, tipo de compra, carrito, descuento y WhatsApp
   Precios en dólares (USD) y, debajo, en pesos (COP) según la TRM.
   ========================================================== */

// Frascos por presentación y sabor: carrito[presentacion][sabor]
const carrito = {};
Object.keys(PRESENTACIONES).forEach((pk) => {
  carrito[pk] = {};
  Object.keys(SABORES).forEach((k) => { carrito[pk][k] = 0; });
});

let presentacion = 'clasica250';   // presentación que se está editando
let canal = 'consumidor';          // consumidor | importador | mayorista
let descuento = 0;                 // descuento ganado en el juego (%)

const redondear = (n) => Math.round(n * 100) / 100;
const frascosDe = (pk) => Object.values(carrito[pk]).reduce((s, n) => s + n, 0);
const hayOtrasQueClasica = () => Object.keys(PRESENTACIONES).some((pk) => pk !== 'clasica250' && frascosDe(pk) > 0);

// Precio de un frasco de esa presentación según el tipo de compra
function precioFrasco(pk) {
  const p = PRESENTACIONES[pk];
  if (canal === 'consumidor') return p.consumidor;
  if (canal === 'mayorista' && p.mayorista) return p.mayorista;
  return p.importador;
}

// Precio de una caja de 12 de esa presentación
function precioCaja(pk) {
  const p = PRESENTACIONES[pk];
  return canal === 'mayorista' && p.cajaMayorista ? p.cajaMayorista : p.caja;
}

// Agrega un frasco de la presentación elegida (lo usan los botones de la historia y del visor)
function agregarAlPedido(sabor) {
  carrito[presentacion][sabor]++;
  dibujarPedido();
  mostrarAviso('1 frasco de ' + SABORES[sabor].nombre + ' (' + PRESENTACIONES[presentacion].nombre + ') agregado');
}

// Guarda un descuento si es mejor que el actual. Devuelve true si cambió.
function aplicarDescuento(porcentaje) {
  if (porcentaje <= descuento) return false;
  descuento = porcentaje;
  dibujarPedido();
  return true;
}

// Un grupo por presentación con frascos; cada una con su propio precio
function calcularTotales() {
  const grupos = Object.keys(PRESENTACIONES).filter((pk) => frascosDe(pk) > 0).map((pk) => ({
    pk,
    frascos: frascosDe(pk),
    precio: precioFrasco(pk),
    subtotal: redondear(frascosDe(pk) * precioFrasco(pk)),
  }));
  const frascos = grupos.reduce((s, g) => s + g.frascos, 0);
  const subtotal = redondear(grupos.reduce((s, g) => s + g.subtotal, 0));
  const rebaja = canal === 'consumidor' ? redondear(subtotal * descuento / 100) : 0;
  return { grupos, frascos, subtotal, rebaja, total: redondear(subtotal - rebaja) };
}

// Texto corto de sabores de una presentación: "2 Maracuyá · 1 Lulo"
function resumenSabores(pk) {
  return Object.keys(SABORES).filter((k) => carrito[pk][k] > 0)
    .map((k) => `${carrito[pk][k]} ${SABORES[k].nombre}`).join(' · ');
}

// Dibuja opciones, filas, resumen, campo de nombre y botón
function dibujarPedido() {
  const { grupos, frascos, subtotal, rebaja, total } = calcularTotales();
  const nombreGuardado = ($('#nombre') || {}).value || '';

  const chipsPres = Object.keys(PRESENTACIONES).map((k) => {
    const apagado = canal === 'mayorista' && !PRESENTACIONES[k].mayorista;
    const n = frascosDe(k);
    return `<button class="chip" data-pres="${k}" aria-pressed="${k === presentacion}" ${apagado ? 'disabled title="El precio mayorista es solo para la Clásica de 250 g"' : ''}>${PRESENTACIONES[k].nombre}${n ? ` (${n})` : ''}</button>`;
  }).join('');

  const chipsCanal = Object.keys(CANALES).map((k) => {
    const apagado = k === 'mayorista' && hayOtrasQueClasica();
    return `<button class="chip" data-canal="${k}" aria-pressed="${k === canal}" ${apagado ? 'disabled title="El precio mayorista es solo para la Clásica de 250 g"' : ''}>${CANALES[k]}</button>`;
  }).join('');

  const notaCaja = canal === 'consumidor' ? '' : `<br>Caja de 12 frascos: <b>${precioLinea(precioCaja(presentacion))}</b>`;

  const filas = Object.keys(SABORES).map((k) => `
    <div class="pedido__fila" style="--color:${SABORES[k].color}">
      <i></i>
      <b>${SABORES[k].nombre}</b>
      <div class="cantidad">
        <button data-sabor="${k}" data-cambio="-1" aria-label="Quitar ${SABORES[k].nombre}">−</button>
        <span>${carrito[presentacion][k]}</span>
        <button data-sabor="${k}" data-cambio="1" aria-label="Agregar ${SABORES[k].nombre}">+</button>
      </div>
    </div>`).join('');

  const lineasGrupos = grupos.map((g) => `
    <div><span>${PRESENTACIONES[g.pk].nombre} · ${g.frascos} ${g.frascos === 1 ? 'frasco' : 'frascos'}<small class="cop">${resumenSabores(g.pk)}</small></span>
    <span class="precio">${usd(g.subtotal)}<small class="cop">${cop(g.subtotal)}</small></span></div>`).join('');

  const lineaSubtotal = grupos.length > 1 || rebaja
    ? `<div><span>Subtotal (${frascos} frascos)</span><span class="precio">${usd(subtotal)}<small class="cop">${cop(subtotal)}</small></span></div>`
    : '';
  const lineaDescuento = rebaja
    ? `<div><span>Descuento del juego (${descuento}%)</span><span class="precio">−${usd(rebaja)}<small class="cop">${cop(rebaja)}</small></span></div>`
    : '';
  const notaDescuento = descuento && canal !== 'consumidor'
    ? '<div class="resumen__nota">El descuento del juego aplica solo al precio de consumidor.</div>'
    : '';

  $('#pedido-contenido').innerHTML = `
    <div class="opciones"><span class="opciones__titulo">Presentación (cada una lleva su propia cantidad)</span><div class="chips">${chipsPres}</div></div>
    <div class="opciones"><span class="opciones__titulo">Tipo de compra</span><div class="chips">${chipsCanal}</div></div>
    <div class="nota-precio">${PRESENTACIONES[presentacion].nombre}, precio por frasco: <b>${precioLinea(precioFrasco(presentacion))}</b>${notaCaja}</div>
    ${filas}
    <div class="resumen">
      ${lineasGrupos || '<div><span>Aún no hay frascos en el pedido</span></div>'}
      ${lineaSubtotal}
      ${lineaDescuento}
      <div class="total"><span>Total</span><span class="precio">${usd(total)}<small class="cop">${cop(total)}</small></span></div>
      ${notaDescuento}
    </div>
    <input id="nombre" placeholder="Tu nombre" aria-label="Tu nombre" value="${nombreGuardado}">
    <button class="boton-whatsapp" id="enviar" ${frascos ? '' : 'disabled'}>
      ${frascos ? 'Enviar pedido por WhatsApp' : 'Agrega al menos un frasco'}
    </button>`;

  $$('[data-pres]').forEach((b) => { b.onclick = () => { presentacion = b.dataset.pres; dibujarPedido(); }; });
  $$('[data-canal]').forEach((b) => { b.onclick = () => { canal = b.dataset.canal; dibujarPedido(); }; });

  // Botones − y + (suman a la presentación elegida)
  $$('.cantidad button').forEach((boton) => {
    boton.onclick = () => {
      const k = boton.dataset.sabor;
      carrito[presentacion][k] = Math.max(0, carrito[presentacion][k] + Number(boton.dataset.cambio));
      dibujarPedido();
    };
  });

  $('#enviar').onclick = enviarPorWhatsApp;
}

// Tabla de precios de la sección «Precios»
function dibujarPrecios() {
  const filas = Object.values(PRESENTACIONES).map((p) => `
    <tr><td>${p.nombre}</td><td>${precioHTML(p.consumidor)}</td><td>${precioHTML(p.importador)}</td><td>${precioHTML(p.caja)}</td></tr>`).join('');

  $('#tabla-precios').innerHTML = `
    <table>
      <thead><tr><th>Presentación</th><th>Precio al consumidor</th><th>DAAN vende al importador (frasco)</th><th>Caja de 12</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`;

  const m = PRESENTACIONES.clasica250;
  $('#nota-mayorista').innerHTML =
    `A mayoristas (FOB Cartagena), la Clásica de 250 g cuesta <b>${precioLinea(m.mayorista)}</b> el frasco, ` +
    `o <b>${precioLinea(m.cajaMayorista)}</b> la caja de 12. Los pesos se calculan con una tasa de referencia de ` +
    `$${TRM.toLocaleString('de-DE')} por dólar.`;
}

// Arma el mensaje (ordenado por presentación) y abre WhatsApp
function enviarPorWhatsApp() {
  const { grupos, frascos, rebaja, total } = calcularTotales();

  const bloques = grupos.map((g) => {
    const items = Object.keys(SABORES).filter((k) => carrito[g.pk][k] > 0)
      .map((k) => `• ${carrito[g.pk][k]} x ${SABORES[k].nombre}`).join('\n');
    return `*${PRESENTACIONES[g.pk].nombre}* (${usd(g.precio)} c/u)\n${items}\nSubtotal: ${precioLinea(g.subtotal)}`;
  }).join('\n\n');

  const mensaje = [
    '*Pedido DAAN Mermeladas*',
    `Tipo de compra: ${CANALES[canal]}`,
    '',
    bloques,
    '',
    `Total de frascos: ${frascos}`,
    ...(rebaja ? [`Descuento del juego (${descuento}%): −${precioLinea(rebaja)}`] : []),
    `*Total: ${precioLinea(total)}*`,
    '',
    `Nombre: ${$('#nombre').value || '(sin nombre)'}`,
  ].join('\n');

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

/* ==========================================================
   JUEGO: atrapa las frutas y descubre su historia
   - Las frutas caen; mueves el frasco para atraparlas.
   - Cada sabor atrapado abre capítulos (HISTORIA_JUEGO).
   - Al final, las frutas se convierten en descuento (METAS_JUEGO).
   ========================================================== */

const DURACION_JUEGO = 25;        // segundos por partida

let lienzo, pincel;
let ancho = 0, alto = 0;          // tamaño del lienzo en píxeles CSS
let jugando = false;
let tiempo = DURACION_JUEGO;
let capturadas = 0;
let frutas = [];                  // frutas que están cayendo
let efectos = [];                 // "+1" que suben y se desvanecen
let anuncio = null;               // cartel dentro del lienzo
let ultimoCuadro = 0;
let proximaFruta = 0;
let ultimoNuevo = -1;             // capítulo recién abierto (para resaltarlo)
let partidas = 0;
let rafId = 0;                    // cuadro de animación en curso (para poder reiniciar)
let contarNuevos = 0;             // capítulos abiertos durante la partida en curso

const conteo = {};                // frutas atrapadas por sabor (suma entre partidas)
const desbloqueados = new Set();  // índices de HISTORIA_JUEGO ya abiertos
const teclas = { izquierda: false, derecha: false };
const frasco = { x: 0, objetivo: 0, ancho: 80, alto: 80, color: '#F2B705' };

/* ---------- Tamaños ---------- */
function ajustarLienzo() {
  const caja = lienzo.getBoundingClientRect();
  if (!caja.width) return;

  const escala = window.devicePixelRatio || 1;
  const razon = ancho ? caja.width / ancho : 1;

  // Si cambia el tamaño en plena partida, reubica lo que ya está en pantalla
  if (ancho) {
    frasco.x *= razon;
    frasco.objetivo *= razon;
    frutas.forEach((f) => { f.x *= razon; f.y *= caja.height / alto; });
  }

  ancho = caja.width;
  alto = caja.height;
  lienzo.width = Math.round(ancho * escala);
  lienzo.height = Math.round(alto * escala);
  pincel.setTransform(escala, 0, 0, escala, 0, 0);

  frasco.ancho = Math.max(64, Math.min(100, ancho * 0.17));
  frasco.alto = frasco.ancho;
  if (!frasco.x) frasco.x = frasco.objetivo = ancho / 2;
  dibujar();
}

const radioFruta = () => Math.max(13, Math.min(22, ancho * 0.04));
const limitar = (x) => Math.max(frasco.ancho / 2, Math.min(ancho - frasco.ancho / 2, x));

/* ---------- Capítulos de historia ---------- */
function pista(c) {
  if (c.alTerminar) return 'Termina una partida para descubrirlo.';
  const faltan = c.desde - (conteo[c.fruta] || 0);
  const nombre = SABORES[c.fruta].nombre.toLowerCase() + (faltan === 1 ? '' : 's');
  return `Atrapa ${faltan} ${nombre} más.`;
}

function dibujarCapitulos() {
  $('#capitulos').innerHTML = HISTORIA_JUEGO.map((c, i) => {
    if (!desbloqueados.has(i)) {
      return `<li class="capitulo capitulo--bloqueado"><b>🔒 Capítulo secreto</b><p>${pista(c)}</p></li>`;
    }
    const color = c.fruta ? SABORES[c.fruta].color : 'var(--maracuya)';
    const nuevo = i === ultimoNuevo ? ' capitulo--nuevo' : '';
    return `<li class="capitulo${nuevo}" style="--color:${color}"><b>${c.titulo}</b><p>${c.texto}</p></li>`;
  }).join('');
  $('#conteo-capitulos').textContent =
    `${desbloqueados.size} de ${HISTORIA_JUEGO.length} capítulos descubiertos`;
}

function desbloquear(i) {
  desbloqueados.add(i);
  ultimoNuevo = i;
  anuncio = { texto: '¡Nuevo capítulo de historia!', t: 2 };
  dibujarCapitulos();
  return HISTORIA_JUEGO[i];
}

/* ---------- Partida ---------- */
function mensajeInicial() {
  const metas = METAS_JUEGO.map((m) => `${m.frutas} frutas = ${m.descuento}%`).join(' · ');
  $('#mensaje-juego').innerHTML =
    `<b>Tienes ${DURACION_JUEGO} segundos.</b><br>Descuentos: ${metas}.`;
}

function empezar() {
  if (jugando) return;
  jugando = true;
  tiempo = DURACION_JUEGO;
  capturadas = 0;
  frutas = [];
  efectos = [];
  anuncio = null;
  proximaFruta = 0.3;
  ultimoNuevo = -1;
  dibujarCapitulos();
  mensajeInicial();
  actualizarDatos();

  lienzo.style.touchAction = 'none';   // arrastrar el dedo no mueve la página
  $('#boton-jugar').disabled = true;
  $('#boton-jugar').textContent = 'Jugando…';
  ultimoCuadro = performance.now();
  rafId = requestAnimationFrame(bucle);
}

function reiniciar() {
  cancelAnimationFrame(rafId);
  jugando = false;
  tiempo = DURACION_JUEGO;
  capturadas = 0;
  frutas = [];
  efectos = [];
  anuncio = null;
  contarNuevos = 0;
  ultimoNuevo = -1;
  teclas.izquierda = teclas.derecha = false;
  frasco.color = '#F2B705';
  frasco.x = frasco.objetivo = ancho / 2;
  lienzo.style.touchAction = 'pan-y';
  $('#boton-jugar').disabled = false;
  $('#boton-jugar').textContent = 'Jugar';
  dibujarCapitulos();
  mensajeInicial();
  actualizarDatos();
  dibujar();
}

function terminar() {
  jugando = false;
  partidas++;
  teclas.izquierda = teclas.derecha = false;
  lienzo.style.touchAction = 'pan-y';
  $('#boton-jugar').disabled = false;
  $('#boton-jugar').textContent = 'Jugar otra vez';

  // Capítulo que se abre al terminar la primera partida
  let nuevos = 0;
  HISTORIA_JUEGO.forEach((c, i) => {
    if (c.alTerminar && !desbloqueados.has(i)) { desbloquear(i); nuevos++; }
  });
  nuevos += contarNuevos;
  contarNuevos = 0;

  // Mejor meta alcanzada
  const meta = METAS_JUEGO.filter((m) => capturadas >= m.frutas).pop();
  let texto;
  if (meta) {
    const mejoro = aplicarDescuento(meta.descuento);
    texto = `<b>¡Atrapaste ${capturadas} frutas y ganaste ${meta.descuento}%!</b><br>` +
      (mejoro ? 'Ya está aplicado en tu pedido.' : 'Tu mejor descuento sigue activo.');
  } else {
    texto = `<b>Atrapaste ${capturadas} frutas.</b><br>` +
      `Con ${METAS_JUEGO[0].frutas} consigues el primer descuento. ¡Inténtalo otra vez!`;
  }
  if (nuevos) texto += `<br>Capítulos nuevos de historia: ${nuevos}.`;
  $('#mensaje-juego').innerHTML = texto;

  dibujarCapitulos();   // actualiza las pistas de los capítulos que faltan
  dibujar();
}

function actualizarDatos() {
  $('#tiempo').textContent = Math.max(0, Math.ceil(tiempo));
  $('#puntos').textContent = capturadas;
}

/* ---------- Bucle del juego ---------- */
function bucle(ahora) {
  if (!jugando) return;
  const dt = Math.min(0.05, (ahora - ultimoCuadro) / 1000);   // pausa sola si la pestaña se oculta
  ultimoCuadro = ahora;

  actualizar(dt);
  dibujar();

  if (tiempo <= 0) terminar();
  else rafId = requestAnimationFrame(bucle);
}

function actualizar(dt) {
  tiempo -= dt;
  const progreso = 1 - tiempo / DURACION_JUEGO;   // 0 al empezar, 1 al terminar

  // Frasco: teclado y seguimiento suave del mouse o dedo
  const dir = (teclas.derecha ? 1 : 0) - (teclas.izquierda ? 1 : 0);
  if (dir) frasco.objetivo = limitar(frasco.objetivo + dir * ancho * 0.9 * dt);
  frasco.x += (frasco.objetivo - frasco.x) * Math.min(1, dt * 14);

  // Nuevas frutas: cada vez más seguidas
  proximaFruta -= dt;
  if (proximaFruta <= 0) {
    crearFruta(progreso);
    proximaFruta = (0.8 - 0.35 * progreso) * (0.8 + Math.random() * 0.4);
  }

  // Caída y captura
  const bocaY = alto - 8 - frasco.alto * 0.88;
  frutas = frutas.filter((f) => {
    f.y += f.vy * dt;
    f.giro += f.vgiro * dt;

    const dentro = Math.abs(f.x - frasco.x) <= frasco.ancho / 2 + f.r * 0.2;
    if (dentro && f.y + f.r * 0.6 >= bocaY && f.y < bocaY + frasco.alto * 0.4) {
      atrapar(f);
      return false;
    }
    return f.y < alto + f.r * 2;
  });

  efectos = efectos.filter((e) => (e.t -= dt) > 0);
  if (anuncio && (anuncio.t -= dt) <= 0) anuncio = null;
  actualizarDatos();
}

function crearFruta(progreso) {
  const tipos = Object.keys(SABORES);
  const r = radioFruta();
  frutas.push({
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
    x: r + Math.random() * (ancho - 2 * r),
    y: -r,
    r,
    vy: alto * (0.42 + Math.random() * 0.3) * (1 + 0.5 * progreso),
    giro: Math.random() * 6.28,
    vgiro: (Math.random() - 0.5) * 3,
  });
}

function atrapar(f) {
  capturadas++;
  conteo[f.tipo] = (conteo[f.tipo] || 0) + 1;
  frasco.color = SABORES[f.tipo].color;
  efectos.push({ x: f.x, y: f.y, t: 0.6, color: SABORES[f.tipo].color });

  // ¿Esta fruta abre algún capítulo?
  HISTORIA_JUEGO.forEach((c, i) => {
    if (c.fruta === f.tipo && conteo[f.tipo] >= c.desde && !desbloqueados.has(i)) {
      const capitulo = desbloquear(i);
      contarNuevos++;
      $('#mensaje-juego').innerHTML = `<b>Historia desbloqueada</b><br>${capitulo.titulo}`;
    }
  });
}

/* ---------- Dibujo ---------- */
function rectRedondo(x, y, w, h, r) {
  pincel.beginPath();
  pincel.moveTo(x + r, y);
  pincel.arcTo(x + w, y, x + w, y + h, r);
  pincel.arcTo(x + w, y + h, x, y + h, r);
  pincel.arcTo(x, y + h, x, y, r);
  pincel.arcTo(x, y, x + w, y, r);
  pincel.closePath();
}

function dibujarFruta(f) {
  const { tipo, r } = f;
  const color = SABORES[tipo].color;
  pincel.save();
  pincel.translate(f.x, f.y);
  pincel.rotate(f.giro);

  // Cuerpo: las tres frutas son redondas
  pincel.fillStyle = color;
  pincel.beginPath();
  pincel.arc(0, 0, r, 0, 6.28);
  pincel.fill();

  // Sombra en el borde y brillo, para que se vea redonda
  const sombra = pincel.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r * 1.1);
  sombra.addColorStop(0, '#ffffff55');
  sombra.addColorStop(0.55, '#ffffff00');
  sombra.addColorStop(1, '#00000040');
  pincel.fillStyle = sombra;
  pincel.fill();

  if (tipo === 'granadilla') {       // tallito verde y pecas claras
    pincel.fillStyle = '#5c8a2a';
    pincel.beginPath();
    pincel.ellipse(0, -r * 0.95, r * 0.12, r * 0.22, 0, 0, 6.28);
    pincel.fill();
    pincel.fillStyle = '#ffffff55';
    [[-0.45, 0.1], [0.35, 0.45], [0.1, -0.3]].forEach(([a, b]) => {
      pincel.beginPath();
      pincel.arc(a * r, b * r, r * 0.07, 0, 6.28);
      pincel.fill();
    });
  }
  if (tipo === 'lulo') {             // corona de hojitas
    pincel.fillStyle = '#3f6b16';
    for (let i = -1; i <= 1; i++) {
      pincel.beginPath();
      pincel.ellipse(i * r * 0.28, -r * 0.95, r * 0.14, r * 0.3, i * 0.5, 0, 6.28);
      pincel.fill();
    }
  }
  if (tipo === 'maracuya') {         // hoyuelo del tallo
    pincel.fillStyle = '#8a5a00';
    pincel.beginPath();
    pincel.arc(0, -r * 0.85, r * 0.12, 0, 6.28);
    pincel.fill();
  }
  pincel.restore();
}

function dibujarFrasco() {
  const w = frasco.ancho, h = frasco.alto;
  const x0 = frasco.x - w / 2;
  const cima = alto - 8 - h;

  pincel.fillStyle = '#c9a24a';                      // tapa
  rectRedondo(x0 + w * 0.1, cima, w * 0.8, h * 0.16, 5);
  pincel.fill();

  pincel.fillStyle = frasco.color;                   // vidrio, del color de la última fruta
  rectRedondo(x0, cima + h * 0.12, w, h * 0.88, w * 0.18);
  pincel.fill();

  pincel.fillStyle = '#ffffff55';                    // brillo
  rectRedondo(x0 + w * 0.08, cima + h * 0.24, w * 0.1, h * 0.55, 4);
  pincel.fill();

  pincel.fillStyle = '#fffdf0';                      // etiqueta
  rectRedondo(x0 + w * 0.22, cima + h * 0.4, w * 0.56, h * 0.34, 5);
  pincel.fill();
}

function dibujar() {
  if (!pincel) return;
  pincel.clearRect(0, 0, ancho, alto);

  frutas.forEach(dibujarFruta);
  dibujarFrasco();

  pincel.textAlign = 'center';
  pincel.font = '800 18px "Nunito Sans", sans-serif';
  efectos.forEach((e) => {
    pincel.globalAlpha = Math.min(1, e.t / 0.4);
    pincel.fillStyle = e.color;
    pincel.fillText('+1', e.x, e.y - (0.6 - e.t) * 60);
  });
  pincel.globalAlpha = 1;

  if (anuncio) {
    pincel.font = '700 15px "Nunito Sans", sans-serif';
    const w = pincel.measureText(anuncio.texto).width + 32;
    pincel.fillStyle = '#2b2236ee';
    rectRedondo(ancho / 2 - w / 2, 12, w, 34, 17);
    pincel.fill();
    pincel.fillStyle = '#F2B705';
    pincel.fillText(anuncio.texto, ancho / 2, 34);
  }
}

/* ---------- Controles y arranque ---------- */
function moverConPuntero(e) {
  const caja = lienzo.getBoundingClientRect();
  frasco.objetivo = limitar(e.clientX - caja.left);
  if (!jugando) { frasco.x = frasco.objetivo; dibujar(); }
}

function teclado(abajo) {
  return (e) => {
    const izquierda = e.key === 'ArrowLeft' || e.key === 'a';
    const derecha = e.key === 'ArrowRight' || e.key === 'd';
    if (!jugando || (!izquierda && !derecha)) return;
    e.preventDefault();                               // las flechas no mueven la página
    if (izquierda) teclas.izquierda = abajo;
    if (derecha) teclas.derecha = abajo;
  };
}

function iniciarJuego() {
  lienzo = $('#lienzo');
  pincel = lienzo.getContext('2d');

  lienzo.addEventListener('pointermove', moverConPuntero);
  lienzo.addEventListener('pointerdown', moverConPuntero);
  window.addEventListener('keydown', teclado(true));
  window.addEventListener('keyup', teclado(false));
  $('#boton-jugar').onclick = empezar;
  $('#boton-reiniciar').onclick = reiniciar;

  new ResizeObserver(ajustarLienzo).observe(lienzo);
  ajustarLienzo();
  dibujarCapitulos();
  mensajeInicial();
}

/* ==========================================================
   SABORES: frascos (foto o dibujo), portada y recorrido
   ========================================================== */

let saborActual = 'maracuya';
const fotosListas = {};   // { maracuya: true, ... } cuando la foto existe

// Devuelve la foto del sabor si existe; si no, un frasco dibujado con CSS
function imagenFrasco(sabor, ancho, anchoFoto) {
  const s = SABORES[sabor];

  if (fotosListas[sabor]) {
    return `<img class="foto" src="${FOTOS[sabor]}" alt="Frasco de mermelada de ${s.nombre}" style="--ancho-foto:${anchoFoto}px">`;
  }

  return `
    <div class="frasco" style="--color:${s.color};--ancho:${ancho}px">
      <div class="frasco__tapa"></div>
      <div class="frasco__vidrio">
        <div class="frasco__etiqueta">${s.nombre}</div>
      </div>
    </div>`;
}

// Tres frascos flotantes de la portada: [sabor, profundidad, giro, ancho, anchoFoto]
// Al pasar el mouse (o tocar) cada uno abre el visor (ver js/visor.js)
function dibujarFrascosPortada() {
  const frascos = [
    ['maracuya', -14, '-6deg', 110, 160],
    ['lulo',      18,  '3deg', 150, 210],
    ['granadilla', -24,  '8deg', 110, 160],
  ];

  $('#frascos-fila').innerHTML = frascos.map(([sabor, prof, giro, ancho, anchoFoto]) => `
    <div class="flotante" data-sabor="${sabor}" tabindex="0" role="button" aria-label="Ver ${SABORES[sabor].nombre}">
      <div style="--profundidad:${prof};--giro:${giro}">
        ${imagenFrasco(sabor, ancho, anchoFoto)}
      </div>
    </div>`).join('');
}

// Botones de pestañas (uno por sabor)
function dibujarPestanas() {
  $('#pestanas').innerHTML = Object.keys(SABORES).map((k) => `
    <button class="pestana" role="tab" data-sabor="${k}" style="--color:${SABORES[k].color}">
      ${SABORES[k].nombre}
    </button>`).join('');

  $$('.pestana').forEach((boton) => {
    boton.onclick = () => mostrarSabor(boton.dataset.sabor);
  });
}

// Cambia el sabor: anima el escenario y escribe la historia
function mostrarSabor(sabor) {
  saborActual = sabor;
  const s = SABORES[sabor];

  // Pestaña activa y color de acento de toda la sección
  $$('.pestana').forEach((b) => b.setAttribute('aria-selected', b.dataset.sabor === sabor));
  $('#recorrido').style.setProperty('--acento', s.color);

  // Reinicia la animación del escenario
  const escenario = $('#escenario');
  escenario.classList.remove('animar');
  void escenario.offsetWidth;            // fuerza a reiniciar la animación
  escenario.classList.add('animar');
  escenario.innerHTML = imagenFrasco(sabor, 150, 230);

  // Historia: cada línea entra con un pequeño retraso
  $('#historia').innerHTML = `
    <h3 class="linea" style="animation-delay:.4s">${s.titulo}</h3>
    <p class="linea" style="animation-delay:.55s">${s.historia[0]}</p>
    <p class="linea" style="animation-delay:.7s">${s.historia[1]}</p>
    <div class="notas linea" style="animation-delay:.85s">
      ${s.notas.map((n) => `<i>${n}</i>`).join('')}
    </div>
    <button class="boton linea" style="animation-delay:1s" id="agregar">Agregar al pedido</button>`;

  $('#agregar').onclick = () => agregarAlPedido(sabor);
}

// Intenta cargar cada foto; si existe, la usa en lugar del frasco dibujado
function precargarFotos() {
  Object.keys(FOTOS).forEach((sabor) => {
    const imagen = new Image();
    imagen.onload = () => {
      fotosListas[sabor] = true;
      dibujarFrascosPortada();
      if (sabor === saborActual) mostrarSabor(sabor);
    };
    imagen.src = FOTOS[sabor];
  });
}

// Burbujas de colores que suben detrás de los frascos de la portada
function crearParticulas() {
  const colores = Object.values(SABORES).map((s) => s.color);
  $('#particulas').innerHTML = Array.from({ length: 16 }, (_, i) => {
    const t = 6 + Math.random() * 6, tam = 6 + Math.random() * 12;
    return `<span class="burbuja" style="left:${Math.random() * 100}%;--t:${t}s;--r:${-Math.random() * t}s;--dx:${(Math.random() - .5) * 80}px;width:${tam}px;height:${tam}px;background:${colores[i % colores.length]}"></span>`;
  }).join('');
}

function iniciarSabores() {
  crearParticulas();
  dibujarPestanas();
  dibujarFrascosPortada();
  mostrarSabor(saborActual);
  precargarFotos();
}
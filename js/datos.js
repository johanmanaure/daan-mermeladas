/* ==========================================================
   DATOS: lo que normalmente vas a editar
   ========================================================== */

// Tu número de WhatsApp con indicativo de país, sin + ni espacios
const WHATSAPP = '573148431085';

// Tasa de cambio de referencia: pesos colombianos por 1 dólar (aprox. 19-nov-2026). Actualízala cuando quieras.
const TRM = 3327;

// Precios en dólares (USD) por presentación.
// consumidor: precio al público · importador: DAAN vende al importador (por frasco) · caja: caja de 12
// mayorista / cajaMayorista: FOB Cartagena (solo la Clásica de 250 g)
const PRESENTACIONES = {
  clasica250:  { nombre: 'Clásica 250 g',    consumidor: 10.99, importador: 5.70, caja: 68.40, mayorista: 4.90, cajaMayorista: 58.80 },
  sin250:      { nombre: 'Sin azúcar 250 g', consumidor: 11.99, importador: 6.20, caja: 74.40 },
  organica250: { nombre: 'Orgánica 250 g',   consumidor: 12.99, importador: 6.75, caja: 81.00 },
  clasica450:  { nombre: 'Clásica 450 g',    consumidor: 16.99, importador: 8.80, caja: 105.60 },
};

// Tipos de compra
const CANALES = { consumidor: 'Consumidor', importador: 'Importador', mayorista: 'Mayorista (FOB Cartagena)' };

// Fotos de los frascos (PNG con fondo transparente, en assets/img/).
// Si una foto no existe, se dibuja un frasco con CSS.
const FOTOS = {
  maracuya: 'assets/img/maracuya.png',
  lulo:     'assets/img/lulo.png',
  granadilla: 'assets/img/granadilla.png',
};

// Sabores: nombre, color, historia, notas y ficha de cada uno.
// "peso" e "ingredientes" salen en el visor (frasco que da la vuelta).
// Los valores de peso e ingredientes son de ejemplo: cámbialos por los reales.
const SABORES = {
  maracuya: {
    nombre: 'Maracuyá',
    color: '#F2B705',
    titulo: 'Una flor que cuenta una historia',
    historia: [
      'Los misioneros españoles vieron en su flor los símbolos de la Pasión de Cristo. De ahí viene el nombre «passion fruit».',
      'La cosechamos cuando la cáscara se arruga: ahí la pulpa está más dulce y aromática.',
    ],
    notas: ['Ácida', 'Aromática', 'Con yogur'],
    peso: '250 g',
    ingredientes: 'Pulpa de maracuyá, azúcar, jugo de limón',
  },
  lulo: {
    nombre: 'Lulo',
    color: '#8DBB2F',
    titulo: 'El tesoro de los Andes',
    historia: [
      'El lulo, o naranjilla, crece en laderas frescas y nubladas. Es pariente del tomate, aunque sabe a piña con fresa ácida.',
      'Lo pelamos a mano y cocinamos su pulpa verde para guardar ese golpe de frescura.',
    ],
    notas: ['Cítrica', 'Fresca', 'Con queso crema'],
    peso: '250 g',
    ingredientes: 'Pulpa de lulo, azúcar, jugo de limón',
  },
  granadilla: {
    nombre: 'Granadilla',
    color: '#F28C28',
    titulo: 'Dulzor de los Andes',
    historia: [
      'La granadilla es pariente cercana de la maracuyá y crece en los Andes. Su cáscara dura y anaranjada esconde una pulpa transparente y dulce.',
      'Abrimos cada fruta a mano y cocinamos su pulpa con sus semillas crujientes, a fuego lento, para que sepa a fruta recién abierta.',
    ],
    notas: ['Dulce', 'Perfumada', 'Con helado'],
    peso: '250 g',
    ingredientes: 'Pulpa de granadilla, azúcar, jugo de limón',
  },
};

// Capítulos de historia que se desbloquean en el juego «Atrapa las frutas».
// fruta + desde: se abre al atrapar esa cantidad de frutas de ese sabor
//                (se suma entre partidas mientras no recargues la página).
// alTerminar:    se abre al terminar la primera partida.
const HISTORIA_JUEGO = [
  { fruta: 'maracuya', desde: 1, titulo: 'Una flor con nombre de pasión',
    texto: SABORES.maracuya.historia[0] },
  { fruta: 'lulo', desde: 1, titulo: 'El tesoro de los Andes',
    texto: SABORES.lulo.historia[0] },
  { fruta: 'granadilla', desde: 1, titulo: 'Hermana andina de la maracuyá',
    texto: SABORES.granadilla.historia[0] },
  { fruta: 'maracuya', desde: 8, titulo: 'Nativa de Suramérica',
    texto: 'La maracuyá es originaria de Suramérica. Hoy se cultiva en regiones tropicales de todo el mundo.' },
  { fruta: 'lulo', desde: 8, titulo: 'Fruta de montaña',
    texto: 'El lulo es originario de los Andes y todavía se cosecha en climas frescos de montaña, sobre todo en Colombia y Ecuador.' },
  { fruta: 'granadilla', desde: 8, titulo: 'Una cáscara que protege',
    texto: 'Su cáscara dura y lisa protege la pulpa gelatinosa y las semillas negras, que se comen junto con ella.' },
  { alTerminar: true, titulo: 'De «marmelada» a mermelada',
    texto: 'La palabra mermelada viene del portugués «marmelada»: así se llamaba el dulce que se hacía con marmelo, o membrillo.' },
];

// Descuentos del juego: frutas atrapadas -> porcentaje (de menor a mayor)
const METAS_JUEGO = [
  { frutas: 12, descuento: 5 },
  { frutas: 20, descuento: 10 },
  { frutas: 28, descuento: 15 },
];

// Preguntas frecuentes: [pregunta, respuesta]
const PREGUNTAS = [
  ['¿Cómo hago el pedido?', 'Eliges tus frascos, escribes tu nombre y pulsas el botón verde. Se abre WhatsApp con tu pedido ya escrito.'],
  ['¿Cuánto cuesta cada frasco?', 'Depende de la presentación (250 g o 450 g; clásica, sin azúcar u orgánica) y de si compras como consumidor, importador o mayorista. Los precios están en dólares y, debajo, en pesos colombianos: mira la tabla de precios.'],
  ['¿Cómo funciona el descuento del juego?', 'Mientras más frutas atrapes en el juego, mayor es el descuento. Se aplica al total de tu pedido como consumidor y solo cuenta el mejor que ganes.'],
  ['¿Hay más sabores?', 'Por ahora son tres: maracuyá, lulo y granadilla. Pronto habrá lotes de temporada.'],
];
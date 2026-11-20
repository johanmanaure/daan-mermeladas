# Mermeladas Gourmet

Página estática (HTML + CSS + JavaScript puro), sin dependencias ni instalación.

## Estructura

```
mermeladas-gourmet/
├── index.html              estructura de la página, con comentarios por sección
├── css/
│   ├── variables.css       colores, tipografías, modo claro/oscuro
│   ├── base.css            reset, botones, animación de aparición
│   ├── header.css          menú superior
│   ├── portada.css         portada y contadores
│   ├── sabores.css         frascos, fotos y recorrido por sabores
│   ├── secciones.css       tarjetas, tabla comparativa, línea de tiempo
│   ├── pedido.css          carrito y botón de WhatsApp
│   ├── juego.css           juego de atrapar frutas e historia
│   ├── faq.css             preguntas frecuentes
│   └── footer.css          llamada final, pie y aviso emergente
├── js/
│   ├── datos.js            ★ lo que vas a editar: WhatsApp, precio, sabores, textos
│   ├── utilidades.js       atajos ($, $$, dinero, mostrarAviso)
│   ├── pedido.js           carrito, descuento y mensaje de WhatsApp
│   ├── sabores.js          frascos/fotos, pestañas e historia
│   ├── juego.js            juego de atrapar frutas e historia
│   ├── faq.js              acordeón
│   ├── animaciones.js      título, scroll, contadores, efectos con el mouse
│   └── main.js             arranca todo
└── assets/img/             tus fotos: maracuya.png, lulo.png, granadilla.png y logo.png
```

## Cómo abrirla en Visual Studio Code

1. **File > Open Folder** y elige `mermeladas-gourmet`.
2. Instala la extensión **Live Server**.
3. Clic derecho en `index.html` > **Open with Live Server**.

(También funciona con doble clic en `index.html`.)

## Qué cambiar primero (js/datos.js)

- `WHATSAPP`: tu número con indicativo de país.
- `TRM` y `PRESENTACIONES`: tasa del dólar y precios en USD (los pesos se calculan solos).
- `FOTOS`: rutas de tus fotos.
- `SABORES`, `HISTORIA_JUEGO`, `METAS_JUEGO`, `PREGUNTAS`: los textos, la historia del juego y los descuentos.

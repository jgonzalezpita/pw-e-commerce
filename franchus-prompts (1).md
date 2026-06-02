# Prompts Franchus

---

## Prompt 1 — Migrar proyecto a Next.js

> Tengo una tienda online de joyería llamada **Franchus** hecha con HTML, CSS y JavaScript puro. Necesito migrarla a **Next.js**. Te voy a compartir mis tres archivos: `index.html`, `styles.css` y `script.js`.
>
> **Para crear el proyecto usá:**
> ```
> npx create-next-app@latest franchus
> ```
> Cuando pregunte, elegí: JavaScript (no TypeScript), no usar Tailwind, sí usar App Router.
>
> **Lo que quiero lograr:**
> - Mantener exactamente el mismo diseño visual (el CSS lo reutilizo tal cual)
> - Migrar toda la lógica de JS a componentes React con hooks
>
> **Estructura de componentes que quiero:**
> - `app/layout.js` — layout raíz, importa el CSS global
> - `app/page.js` — página principal
> - `components/Navbar.jsx` — barra de navegación con buscador y botón del carrito
> - `components/Marquee.jsx` — barra animada superior
> - `components/ProductCard.jsx` — tarjeta individual de producto (recibe nombre, precio, imagen, categoría como props)
> - `components/ProductSection.jsx` — sección de productos (Aros, Collares, Pulseras)
> - `components/CarritoPanel.jsx` — panel lateral del carrito
> - `components/CarritoItem.jsx` — ítem individual dentro del carrito
> - `components/ModalProducto.jsx` — modal de detalle del producto
> - `components/ModalCheckout.jsx` — modal de checkout con 3 pasos
> - `components/Footer.jsx` — footer con suscripción a novedades
>
> **Datos de productos:** extraelos del HTML y convertílos en un array de objetos en `src/data/productos.js`:
> ```js
> export const productos = [
>   { id: 1, nombre: "Aro Honguito", precio: 20000, imagen: "/catalogo/aro-honguito.png", categoria: "aros", descripcion: "..." },
>   ...
> ]
> ```
>
> **Estado global:** el carrito (`useState`) debe vivir en el componente raíz y pasarse como prop a los componentes que lo necesiten. Todos los componentes que usen hooks o eventos del navegador deben tener `"use client"` al inicio del archivo.
>
> **Lógica importante a conservar:**
> - El carrito se guarda en `localStorage` con la clave `franchus-carrito`
> - Hay un descuento del 20% si el método de pago es transferencia
> - El checkout tiene 3 pasos: Envío → Pago → Confirmar
> - El buscador filtra productos por nombre en tiempo real
> - El filtro por categoría (Aros / Collares / Pulseras) en el navbar hace scroll a la sección correspondiente
> - Las descripciones de cada producto están hardcodeadas, incluílas en el array de productos
>
> **Imágenes:**
> - Copiá la carpeta `catalogo/` dentro de `public/` de Next.js
> - Usá el componente `<Image>` de `next/image` con `width`, `height` y `alt`
>
> **CSS:**
> - Copiá el `styles.css` original a `app/globals.css` sin modificarlo
> - Importalo en `app/layout.js`
>
> **Importante:**
> - No uses TypeScript, solo JavaScript
> - No uses Tailwind
> - Mostrá el código completo de cada archivo, uno por uno
>
> Acá van mis archivos originales: [pegá el HTML, CSS y JS acá]

Respuesta al prompt: No me funciono 
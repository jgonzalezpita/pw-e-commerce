# Correcciones para la reentrega

Se corrigieron los tres errores marcados en la evaluación (fila González Pita).

## 1. Validación de formularios (antes aceptaba teléfono "test", precio/stock negativos y newsletter "123")

Se creó un módulo de validación compartido: `lib/validaciones.js` (email, teléfono,
código postal, precio, stock). Se usa tanto en el navegador como en la API, así que
**la validación ya no depende solo del front** (más seguro).

- **Newsletter** (`components/Footer.jsx`): rechaza cualquier cosa que no sea un email
  válido. "123" ya no pasa; muestra mensaje de error.
- **Checkout** (`components/ModalCheckout.jsx`): valida nombre, email (formato real),
  teléfono (solo números, mínimo 8 dígitos — "test" ya no pasa) y código postal.
  Cada campo inválido se marca en rojo con su mensaje.
- **Registro** (`app/auth/registro/page.js`): valida nombre y formato de email.
- **Admin — productos** (`app/admin/AdminPanel.jsx` + APIs
  `app/api/admin/productos/route.js` y `.../[id]/route.js`):
  precio debe ser mayor a 0 y stock un entero ≥ 0, tanto al crear como al editar,
  validado **en el cliente y en el servidor**. Los inputs además tienen `min`.

## 2. Pago de MercadoPago (no se pudo completar en vivo: cruce de credenciales)

- `app/api/pagos/crear-preferencia/route.js`: valida que exista `MP_ACCESS_TOKEN` y
  devuelve un error claro si falta. Detecta credenciales de prueba (`TEST-`) y usa
  automáticamente el link de **sandbox** (no cobra dinero real). Ante credenciales
  inválidas devuelve un mensaje entendible en vez del error críptico de MP.
- `app/api/pagos/webhook/route.js`: mismo control de token, sin romper la respuesta a MP.
- `.env.example`: documenta qué credencial va en cada variable y que **ambas deben ser
  de la misma aplicación**.
- **`GUIA-MERCADOPAGO.md`**: paso a paso para dejar la demo andando con credenciales de
  prueba y tarjetas de test. **Esta parte la tenés que hacer vos** en el panel de MP y en
  Vercel (el código ya está listo).

## 3. Responsive roto en móvil

- `components/Navbar.jsx` + `app/globals.css`: la barra superior tenía búsqueda +
  categorías + botones + carrito en una sola fila y se desbordaba en el celular.
  Ahora en móvil hay un **menú hamburguesa**: quedan visibles el logo, el carrito y el
  botón de menú; al abrirlo se despliega un panel con la búsqueda, las categorías y la
  sesión, apilados. Se agregó `overflow-x: hidden` como red de seguridad.

## Cómo probar localmente

```bash
npm install
npm run dev
```

Antes de reentregar conviene correr `npm run build` para confirmar que compila, y seguir
el checklist de `GUIA-MERCADOPAGO.md` para la demo del pago.

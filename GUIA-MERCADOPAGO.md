# Guía: dejar el pago de MercadoPago funcionando para la demo

El código ya quedó arreglado y robusto. Lo que sigue es la configuración que va
en el **panel de MercadoPago** y en tu entorno (no se puede hacer desde el código).

## El problema que marcó el profe

"Cruce de credenciales del sandbox, entorno mal configurado." Pasó porque en
`.env.local` había credenciales de **producción** (`APP_USR-...`) usadas para
probar. Con eso el checkout intenta cobrar dinero real y, si el Access Token y la
Public Key no son de la misma aplicación, MercadoPago rechaza el pago.

## Solución (5 minutos)

1. Entrá a https://www.mercadopago.com.ar/developers → **Tus integraciones**.
2. Abrí tu aplicación (o creá una: tipo "Pagos online", producto "Checkout Pro").
3. Andá a **Pruebas → Credenciales de prueba** y copiá el par:
   - **Access Token** → va en `MP_ACCESS_TOKEN`
   - **Public Key** → va en `NEXT_PUBLIC_MP_PUBLIC_KEY`
   - ⚠️ OJO: las credenciales de prueba nuevas de MercadoPago **empiezan con
     `APP_USR-`**, igual que las de producción. No te confundas: lo que importa es
     que las saques de la sección **"Credenciales de prueba"** (no de "Producción")
     y que ambas sean de la **misma aplicación**.
4. Pegalas en `.env.local` (local) y en **Vercel → Settings → Environment Variables** (producción).
5. Redeploy en Vercel para que tome las variables nuevas.

## Cómo pagar en la demo sin gastar plata

Con credenciales `TEST-`, el código usa automáticamente el link de **sandbox**.
Para simular una compra:

1. En el panel de MP → **Cuentas de prueba**, creá un **comprador de prueba**
   (te da un email y password de test).
2. Al llegar al checkout, iniciá sesión con ese comprador de prueba.
3. Pagá con una **tarjeta de prueba**, por ejemplo (Mastercard):
   - Número: `5031 7557 3453 0604`
   - Vencimiento: `11/30` · CVV: `123`
   - Nombre del titular: `APRO` (fuerza pago **aprobado**)
   - Para probar un rechazo, usá el nombre `OTHE`.
4. El webhook actualiza la orden a "pagada" automáticamente.

## Checklist final antes de reentregar

- [ ] `MP_ACCESS_TOKEN` y `NEXT_PUBLIC_MP_PUBLIC_KEY` son el par de **"Credenciales de prueba" de la misma app** (empiezan con `APP_USR-`)
- [ ] Mismas variables cargadas en **Vercel** (Production)
- [ ] Redeploy hecho
- [ ] Probé una compra de punta a punta con tarjeta de prueba `APRO`

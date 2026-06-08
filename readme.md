# Franchus Jewelry

E-commerce de joyería fina en acero inoxidable bañado en oro. Desarrollado como Trabajo Práctico para Programación Web 2026 Q1 (ITBA).

🌐 **Demo en vivo:** [franchus.vercel.app](https://franchus.vercel.app)

---

## Funcionalidades

- **Catálogo** con filtros por categoría (aros, collares, pulseras) y búsqueda en tiempo real
- **Carrito persistente** — localStorage para usuarios anónimos, Supabase para usuarios autenticados
- **Autenticación** — registro, login y recuperación de contraseña con Supabase Auth
- **Checkout en 3 pasos** — datos de envío, método de pago y confirmación
- **Pago con Mercado Pago** — integración con SDK oficial, redirección al checkout de MP y webhook para actualizar el estado de la orden
- **Panel de administración** — gestión de productos (CRUD), órdenes y creación manual de pedidos
- **Roles de usuario** — `admin` y `cliente`, con rutas protegidas

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Autenticación | Supabase Auth |
| Pagos | Mercado Pago SDK |
| Despliegue | Vercel |
| CI/CD | GitHub Actions |

---

## Estructura del proyecto

```
app/
  page.js                  # Tienda principal
  admin/                   # Panel de administración (rol admin)
  auth/                    # Login, registro, reset de contraseña
  checkout/                # Página de checkout post-orden
  ordenes/                 # Historial de órdenes del usuario
  api/
    productos/             # GET catálogo público
    carrito/               # GET/POST carrito del usuario
    ordenes/               # GET/POST órdenes
    pagos/
      crear-preferencia/   # POST → crea preferencia en Mercado Pago
      webhook/             # POST → recibe notificaciones de MP
    admin/                 # CRUD protegido para admin
components/
  Navbar.jsx
  CarritoPanel.jsx
  ModalCheckout.jsx
  ModalProducto.jsx
  ProductSection.jsx
  Hero.jsx  |  Footer.jsx  |  Marquee.jsx  |  Favoritos.jsx
lib/
  supabase.js              # Cliente Supabase (browser)
  supabase-server.js       # Cliente Supabase (server)
  supabase-admin.js        # Cliente con service role (admin)
  admin-auth.js            # Middleware de autorización admin
```

---

## Correr localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/jgonzalezpita/pw-e-commerce.git
cd pw-e-commerce

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Completar con tus credenciales de Supabase y Mercado Pago

# 4. Levantar el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de service role (solo servidor) |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Public Key de Mercado Pago |
| `NEXT_PUBLIC_APP_URL` | URL base de la app (ej: https://franchus.vercel.app) |

---

## Base de datos

Las tablas en Supabase son: `productos`, `usuarios`, `carrito`, `ordenes`, `orden_items`. Todas tienen Row Level Security (RLS) habilitado. Las órdenes se crean mediante la función `crear_orden_completa` que ejecuta la transacción de forma atómica.

---

## CI/CD

Cada push a `main` y cada Pull Request ejecuta el pipeline de GitHub Actions (`.github/workflows/ci.yml`) que corre lint y build. Vercel despliega automáticamente a producción en cada merge a `main` y genera un preview por cada PR.

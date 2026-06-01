-- ============================================================
-- FRANCHUS JEWELRY — Supabase Setup
-- Pegar este SQL en: Supabase Dashboard > SQL Editor > Run
-- ============================================================


-- ============================================================
-- TABLA: productos
-- ============================================================
CREATE TABLE productos (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre      VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio      DECIMAL(10, 2) NOT NULL,
  stock       INT DEFAULT 0,
  imagen_url  VARCHAR(500),
  categoria   VARCHAR(100),
  favorito    BOOLEAN DEFAULT false,
  creado_en   TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS y permitir lectura pública
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos visibles para todos"
  ON productos FOR SELECT
  USING (true);

-- Índice para búsquedas por categoría
CREATE INDEX idx_productos_categoria ON productos(categoria);

-- Datos del catálogo Franchus
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, categoria, favorito) VALUES
  ('Aro Honguito',     'Aros en forma de honguito con acabado dorado y brillo delicado. Cierre mariposa de seguridad. Livianos y perfectos para el día a día.',            20000, 50, '/catalogo/aro-honguito.png',     'aros',     true),
  ('Aro Brillis',      'Aros con terminación brillante que captura la luz desde todos los ángulos. Un clásico sofisticado para cualquier look.',                           25000, 40, '/catalogo/aro-brillis.png',      'aros',     true),
  ('Aro Rayito',       'Aros delicados en forma de rayito. Minimalistas y elegantes, ideales para combinar con cualquier outfit.',                                         20000, 60, '/catalogo/aro-rayito.png',       'aros',     false),
  ('Aro Flower',       'Aros florales con diseño artesanal inspirado en la naturaleza. Perfectos para looks románticos y femeninos.',                                      20000, 45, '/catalogo/aro-flower.png',       'aros',     false),
  ('Aro Diamond',      'Aros con piedra central que simula un diamante. Atemporales y sofisticados, ideales para ocasiones especiales.',                                   25000, 30, '/catalogo/aro-diamond.png',      'aros',     false),
  ('Aro Cora',         'Aros de diseño único inspirado en formas orgánicas. Femeninos y versátiles para el día y la noche.',                                              25000, 35, '/catalogo/aro-cora.png',         'aros',     false),
  ('Collar Cora',      'Collar con dije de diseño orgánico bañado en oro 18k. Una pieza minimalista que eleva cualquier look.',                                           28000, 20, '/catalogo/collar-cora.png',      'collares', false),
  ('Collar Diamond',   'Collar con dije de circón que imita un diamante. Elegante, atemporal y perfecto como regalo.',                                                    28000, 25, '/catalogo/collar-diamond.png',   'collares', true),
  ('Pulsera Estrella', 'Pulsera ajustable con dije estrella. Un básico imprescindible que se puede usar solo o en conjunto con otras pulseras.',                          22000, 50, '/catalogo/pulsera-estrella.png', 'pulseras', false),
  ('Pulsera Ojitos',   'Pulsera con dijes de ojitos turcos para atraer buena energía. Delicada, significativa y muy versátil.',                                           22000, 50, '/catalogo/pulsera-ojitos.png',   'pulseras', false);


-- ============================================================
-- TABLA: usuarios (extiende auth.users con datos extra)
-- ============================================================
CREATE TABLE usuarios (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      VARCHAR(255) UNIQUE NOT NULL,
  nombre     VARCHAR(255),
  apellido   VARCHAR(255),
  direccion  TEXT,
  telefono   VARCHAR(20),
  creado_en  TIMESTAMP DEFAULT NOW()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios insertan su propio perfil"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================
-- TABLA: carrito
-- ============================================================
CREATE TABLE carrito (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  usuario_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad    INT NOT NULL DEFAULT 1,
  creado_en   TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su carrito"
  ON carrito FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios agregan al carrito"
  ON carrito FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios actualizan su carrito"
  ON carrito FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios eliminan de su carrito"
  ON carrito FOR DELETE
  USING (auth.uid() = usuario_id);

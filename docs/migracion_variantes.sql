-- Migración: sistema de variantes
-- Aplica en Supabase → SQL Editor antes de desplegar el código

-- 1. Columnas nuevas en cajas
ALTER TABLE cajas ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'simple';
ALTER TABLE cajas ADD COLUMN IF NOT EXISTS descripcion_corta text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cajas_tipo_check') THEN
    ALTER TABLE cajas ADD CONSTRAINT cajas_tipo_check CHECK (tipo IN ('simple', 'variantes'));
  END IF;
END $$;

-- 2. Tabla variantes
CREATE TABLE IF NOT EXISTS variantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_id uuid NOT NULL REFERENCES cajas(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  sku text,
  descripcion text,
  precio integer,
  stock integer NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'borrador',
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT variantes_precio_check CHECK (precio IS NULL OR precio > 0),
  CONSTRAINT variantes_estado_check CHECK (estado IN ('borrador', 'publicada', 'archivada'))
);

-- 3. Índice único en SKU cuando no es nulo
CREATE UNIQUE INDEX IF NOT EXISTS variantes_sku_unique ON variantes (sku) WHERE sku IS NOT NULL;

-- 4. Tabla imágenes de variante
CREATE TABLE IF NOT EXISTS variantes_imagenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variante_id uuid NOT NULL REFERENCES variantes(id) ON DELETE CASCADE,
  url text NOT NULL,
  es_principal boolean NOT NULL DEFAULT false,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. Columnas snapshot de variante en items_pedido
ALTER TABLE items_pedido ADD COLUMN IF NOT EXISTS variante_id uuid REFERENCES variantes(id) ON DELETE SET NULL;
ALTER TABLE items_pedido ADD COLUMN IF NOT EXISTS variante_nombre text;
ALTER TABLE items_pedido ADD COLUMN IF NOT EXISTS variante_sku text;

-- 6. Precargar Meta cumplida como variantes + 13 variantes
DO $$
DECLARE
  v_caja_id uuid;
BEGIN
  -- Cambiar tipo de Meta cumplida
  SELECT id INTO v_caja_id FROM cajas WHERE nombre = 'Meta cumplida' LIMIT 1;

  IF v_caja_id IS NOT NULL THEN
    UPDATE cajas SET
      tipo = 'variantes',
      activo = true,
      descripcion_corta = 'Un detalle para celebrar un gran logro. Elige la presentación de graduación que más te guste y acompaña este momento con cariño.',
      descripcion = 'Celebra el esfuerzo, los aprendizajes y el comienzo de una nueva etapa con Meta cumplida. Descubre sus distintas presentaciones con peluche de graduación, globo con mensaje y dulces en una caja decorada. Cada opción tiene su propia fotografía, descripción, precio y disponibilidad: selecciona tu favorita para conocer la presentación que recibirás.',
      precio = 1
    WHERE id = v_caja_id;

    -- Insertar variantes (solo si no existen)
    INSERT INTO variantes (caja_id, nombre, sku, descripcion, orden)
    SELECT v_caja_id, v.nombre, v.sku, v.descripcion, v.orden
    FROM (VALUES
      ('Cerdito Estrella', 'MC-CER-EST', 'Una presentación de graduación con cerdito de peluche, birrete, globo plateado con mensaje de felicitación y dulces. La caja negra con cinta dorada acompaña un regalo alegre para celebrar su logro.', 1),
      ('Pingüino Estrella', 'MC-PIN-EST', 'Un pingüino de peluche con birrete protagoniza esta presentación de graduación. Se acompaña de globo plateado con mensaje de felicitación, dulces y una caja negra con cinta dorada.', 2),
      ('Vaquita Estrella', 'MC-VAC-EST', 'Una vaquita de peluche con birrete, acompañada de globo plateado con mensaje de felicitación y dulces. Una presentación en caja negra con cinta dorada para celebrar este nuevo comienzo.', 3),
      ('Panda Estrella', 'MC-PAN-EST', 'Un panda de peluche con birrete y detalles de graduación, acompañado de globo plateado con mensaje de felicitación y dulces. Su caja negra con cinta dorada completa una presentación para este gran logro.', 4),
      ('Osito Aurora', 'MC-OSI-AUR', 'Un osito de peluche en tono dorado con birrete, acompañado de un globo de apariencia transparente con mensaje dorado y dulces. Presentado en caja negra con cinta dorada para celebrar una etapa cumplida.', 5),
      ('Elefantito Burbuja', 'MC-ELE-BUR', 'Un elefantito de peluche con birrete, globo de apariencia transparente con mensaje dorado y una selección de dulces. La presentación en caja negra con cinta dorada acompaña la alegría de graduarse.', 6),
      ('Cerdito Burbuja', 'MC-CER-BUR', 'Un cerdito de peluche con birrete, acompañado de globo de apariencia transparente con mensaje dorado y dulces. Una presentación en caja negra con cinta dorada para felicitar con un detalle lleno de cariño.', 7),
      ('Plumitas Burbuja', 'MC-AVE-BUR', 'Un peluche amarillo de ave con birrete, acompañado de globo de apariencia transparente con mensaje dorado y dulces. La caja negra con cinta dorada da forma a una celebración alegre y especial.', 8),
      ('Elefantito Estrella', 'MC-ELE-EST', 'Un elefantito de peluche con birrete, acompañado de globo plateado con mensaje de felicitación y dulces. Presentado en caja negra con cinta dorada para reconocer un logro que merece celebrarse.', 9),
      ('Vaquita Burbuja', 'MC-VAC-BUR', 'Una vaquita de peluche con birrete, globo de apariencia transparente con mensaje dorado y dulces. Una presentación en caja negra con cinta dorada para acompañar la alegría de esta graduación.', 10),
      ('Osito Estrella', 'MC-OSI-EST', 'Un osito de peluche claro con birrete, acompañado de globo plateado con mensaje de felicitación y dulces. Su presentación en caja negra con cinta dorada celebra el esfuerzo y la ilusión de una nueva etapa.', 11),
      ('Osito Gala', 'MC-OSI-GAL', 'Un osito de peluche claro con birrete, acompañado de globo de apariencia transparente con mensaje dorado y dulces. La caja de acabado dorado con detalles negros distingue esta presentación de graduación.', 12),
      ('Plumitas Estrella', 'MC-AVE-EST', 'Un peluche amarillo de ave con birrete, acompañado de globo plateado con mensaje de felicitación y dulces. Presentado en caja negra con cinta dorada para celebrar un gran logro con un gesto alegre.', 13)
    ) AS v(nombre, sku, descripcion, orden)
    WHERE NOT EXISTS (
      SELECT 1 FROM variantes WHERE caja_id = v_caja_id AND sku = v.sku
    );
  END IF;
END $$;

SELECT 'Migration complete' AS result;

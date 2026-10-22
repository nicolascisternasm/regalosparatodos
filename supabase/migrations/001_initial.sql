-- =============================================
-- RegalosParaTodos — Schema inicial
-- =============================================

-- Extensión para UUID
create extension if not exists "pgcrypto";

-- ─── CAJAS (catálogo) ────────────────────────
create table if not exists cajas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  descripcion   text not null default '',
  precio        integer not null check (precio > 0),
  precio_original integer,
  emoji         text not null default '🎁',
  categoria     text not null,
  imagen_url    text,
  activo        boolean not null default true,
  orden         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── PEDIDOS ────────────────────────────────
create table if not exists pedidos (
  id                        uuid primary key default gen_random_uuid(),
  numero                    text not null unique,
  estado_comercial          text not null default 'esperando_pago'
                              check (estado_comercial in (
                                'pendiente_confirmacion','esperando_pago',
                                'pago_en_revision','pago_aprobado','cancelado'
                              )),
  estado_operativo          text not null default 'pendiente_autorizacion'
                              check (estado_operativo in (
                                'pendiente_autorizacion','en_preparacion',
                                'listo_despacho','despachado','entregado'
                              )),
  -- comprador (snapshot)
  comprador_nombre          text not null,
  comprador_email           text not null,
  comprador_telefono        text not null,
  -- destinatario (snapshot)
  destinatario_nombre       text not null,
  destinatario_telefono     text not null,
  mensaje_tarjeta           text,
  -- despacho (snapshot)
  despacho_tipo             text not null check (despacho_tipo in ('domicilio','sucursal')),
  despacho_region           text,
  despacho_ciudad           text,
  despacho_direccion        text,
  despacho_numero           text,
  despacho_depto            text,
  despacho_codigo_sucursal  text,
  despacho_nombre_sucursal  text,
  despacho_ciudad_sucursal  text,
  fecha_estimada_despacho   timestamptz not null,
  -- montos
  subtotal                  integer not null,
  costo_despacho            integer not null default 4990,
  total                     integer not null,
  -- admin
  notas_admin               text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ─── ITEMS DE PEDIDO ────────────────────────
create table if not exists items_pedido (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references pedidos(id) on delete cascade,
  caja_id          uuid not null references cajas(id),
  caja_nombre      text not null,   -- snapshot
  caja_emoji       text not null,   -- snapshot
  precio_unitario  integer not null, -- snapshot
  cantidad         integer not null check (cantidad > 0),
  subtotal         integer not null,
  created_at       timestamptz not null default now()
);

-- ─── PAGOS ──────────────────────────────────
create table if not exists pagos (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references pedidos(id) on delete cascade,
  metodo           text not null default 'transferencia'
                     check (metodo in ('transferencia','enlace_pago')),
  monto            integer not null,
  estado           text not null default 'pendiente'
                     check (estado in ('pendiente','aprobado','rechazado')),
  referencia       text,
  comprobante_url  text,
  observaciones    text,
  aprobado_por     text,
  aprobado_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- ─── HISTORIAL DE ESTADOS ───────────────────
create table if not exists historial_estados (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references pedidos(id) on delete cascade,
  campo           text not null check (campo in ('estado_comercial','estado_operativo')),
  valor_anterior  text not null default '',
  valor_nuevo     text not null,
  responsable     text,
  nota            text,
  created_at      timestamptz not null default now()
);

-- ─── ÍNDICES ────────────────────────────────
create index on pedidos (estado_comercial);
create index on pedidos (created_at desc);
create index on pedidos (comprador_email);
create index on items_pedido (pedido_id);
create index on pagos (pedido_id);
create index on historial_estados (pedido_id);

-- ─── FUNCIÓN updated_at ─────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pedidos_updated_at before update on pedidos
  for each row execute function set_updated_at();
create trigger cajas_updated_at before update on cajas
  for each row execute function set_updated_at();

-- ─── RLS (Row Level Security) ───────────────
-- La tabla de pedidos es solo accesible desde el servidor (service role)
-- El cliente solo puede leer su propio pedido por ID (sin login requerido)
alter table cajas enable row level security;
alter table pedidos enable row level security;
alter table items_pedido enable row level security;
alter table pagos enable row level security;
alter table historial_estados enable row level security;

-- Cajas: lectura pública para cajas activas
create policy "cajas_public_read" on cajas
  for select using (activo = true);

-- Pedidos: solo service role puede leer/escribir
-- (el cliente accede vía API Route que usa service role)
-- No se expone lectura directa al anon

-- ─── DATOS DE PRUEBA ────────────────────────
insert into cajas (nombre, descripcion, precio, precio_original, emoji, categoria, orden) values
  ('Caja Romántica', 'Una selección de productos especiales para la persona que amas. Incluye vinos, chocolates y sorpresas.', 29990, 35990, '💝', 'Amor', 1),
  ('Caja Cumpleaños', 'Celebra como se merece con nuestra caja especial de cumpleaños. Chocolates, velas y regalos únicos.', 24990, null, '🎂', 'Cumpleaños', 2),
  ('Caja Mamá', 'Homenajea a tu mamá con productos de cuidado personal y bienestar seleccionados con amor.', 34990, 39990, '🌸', 'Familia', 3),
  ('Caja Amigo Secreto', 'La solución perfecta para el amigo secreto. Divertida, sorprendente y con estilo.', 19990, null, '🎁', 'Ocasiones', 4),
  ('Caja Bebé Nuevo', 'Bienvenido al mundo. Todo lo que necesita el nuevo integrante de la familia.', 39990, 45990, '👶', 'Familia', 5),
  ('Caja Gamer', 'Para el gamer que lo tiene todo. Snacks, accesorios y sorpresas del mundo gaming.', 27990, null, '🎮', 'Hobbies', 6);

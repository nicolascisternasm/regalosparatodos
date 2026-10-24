export type EstadoComercial =
  | 'pendiente_confirmacion'
  | 'esperando_pago'
  | 'pago_en_revision'
  | 'pago_aprobado'
  | 'cancelado'

export type EstadoOperativo =
  | 'pendiente_autorizacion'
  | 'en_preparacion'
  | 'listo_despacho'
  | 'despachado'
  | 'entregado'

export type MetodoPago = 'transferencia' | 'enlace_pago'

export interface Caja {
  id: string
  nombre: string
  descripcion: string
  descripcion_corta?: string
  precio: number
  precio_original?: number
  emoji: string
  categoria: string
  imagen_url?: string
  stock?: number
  activo: boolean
  orden: number
  tipo: 'simple' | 'variantes'
  created_at: string
}

export interface VarianteImagen {
  id: string
  variante_id: string
  url: string
  es_principal: boolean
  orden: number
  created_at: string
}

export interface Variante {
  id: string
  caja_id: string
  nombre: string
  sku?: string
  descripcion?: string
  precio?: number
  stock: number
  estado: 'borrador' | 'publicada' | 'archivada'
  orden: number
  imagenes?: VarianteImagen[]
  created_at: string
  updated_at: string
}

export interface ItemCarrito {
  caja: Caja
  cantidad: number
  variante?: Variante
}

export interface DatosComprador {
  nombre: string
  email: string
  telefono: string
}

export interface DatosDestinatario {
  nombre: string
  telefono: string
  mensaje_tarjeta?: string
}

export interface DatosDespacho {
  tipo: 'domicilio' | 'sucursal'
  // domicilio
  region?: string
  ciudad?: string
  direccion?: string
  numero?: string
  depto?: string
  // sucursal
  codigo_sucursal?: string
  nombre_sucursal?: string
  ciudad_sucursal?: string
}

export interface Pedido {
  id: string
  numero: string
  estado_comercial: EstadoComercial
  estado_operativo: EstadoOperativo
  // comprador (snapshot)
  comprador_nombre: string
  comprador_email: string
  comprador_telefono: string
  // destinatario (snapshot)
  destinatario_nombre: string
  destinatario_telefono: string
  mensaje_tarjeta?: string
  // despacho (snapshot)
  despacho_tipo: 'domicilio' | 'sucursal'
  despacho_region?: string
  despacho_ciudad?: string
  despacho_direccion?: string
  despacho_numero?: string
  despacho_depto?: string
  despacho_codigo_sucursal?: string
  despacho_nombre_sucursal?: string
  despacho_ciudad_sucursal?: string
  fecha_estimada_despacho: string
  // totales
  subtotal: number
  costo_despacho: number
  total: number
  // metadata
  notas_admin?: string
  created_at: string
  updated_at: string
}

export interface ItemPedido {
  id: string
  pedido_id: string
  caja_id: string
  caja_nombre: string      // snapshot
  caja_emoji: string       // snapshot
  precio_unitario: number  // snapshot
  cantidad: number
  subtotal: number
  variante_id?: string
  variante_nombre?: string  // snapshot
  variante_sku?: string     // snapshot
}

export interface Pago {
  id: string
  pedido_id: string
  metodo: MetodoPago
  monto: number
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  referencia?: string
  comprobante_url?: string
  observaciones?: string
  aprobado_por?: string
  aprobado_at?: string
  created_at: string
}

export interface HistorialEstado {
  id: string
  pedido_id: string
  campo: 'estado_comercial' | 'estado_operativo'
  valor_anterior: string
  valor_nuevo: string
  responsable?: string
  nota?: string
  created_at: string
}

export interface PedidoCompleto extends Pedido {
  items: ItemPedido[]
  pagos: Pago[]
  historial: HistorialEstado[]
}

export const LABEL_ESTADO_COMERCIAL: Record<EstadoComercial, string> = {
  pendiente_confirmacion: 'Pendiente de confirmación',
  esperando_pago: 'Esperando pago',
  pago_en_revision: 'Pago en revisión',
  pago_aprobado: 'Pago aprobado',
  cancelado: 'Cancelado',
}

export const LABEL_ESTADO_OPERATIVO: Record<EstadoOperativo, string> = {
  pendiente_autorizacion: 'Pendiente de autorización',
  en_preparacion: 'En preparación',
  listo_despacho: 'Listo para despacho',
  despachado: 'Despachado',
  entregado: 'Entregado',
}

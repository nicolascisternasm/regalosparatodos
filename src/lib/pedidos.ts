import { createAdminClient, supabase } from './supabase'
import { calcularFechaDespacho, recalcularFechaDespacho } from './despacho'
import type {
  Pedido, ItemPedido, PedidoCompleto, ItemCarrito,
  DatosComprador, DatosDestinatario, DatosDespacho,
  EstadoComercial, EstadoOperativo,
} from '@/types'

const COSTO_DESPACHO = 4990

function generarNumeroPedido(): string {
  const ahora = new Date()
  const fecha = ahora.toISOString().slice(2, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `RPT-${fecha}-${rand}`
}

export interface CrearPedidoInput {
  items: ItemCarrito[]
  comprador: DatosComprador
  destinatario: DatosDestinatario
  despacho: DatosDespacho
}

export async function crearPedido(input: CrearPedidoInput): Promise<Pedido> {
  const admin = createAdminClient()
  const { items, comprador, destinatario, despacho } = input

  const subtotal = items.reduce(
    (acc, i) => acc + (i.precio_unitario_override ?? i.variante?.precio ?? i.caja.precio) * i.cantidad,
    0
  )
  const total = subtotal + COSTO_DESPACHO

  const fechaInfo = calcularFechaDespacho()

  const pedidoData = {
    numero: generarNumeroPedido(),
    estado_comercial: 'esperando_pago' as EstadoComercial,
    estado_operativo: 'pendiente_autorizacion' as EstadoOperativo,
    comprador_nombre: comprador.nombre,
    comprador_email: comprador.email,
    comprador_telefono: comprador.telefono,
    destinatario_nombre: destinatario.nombre,
    destinatario_telefono: destinatario.telefono,
    mensaje_tarjeta: destinatario.mensaje_tarjeta ?? null,
    despacho_tipo: despacho.tipo,
    despacho_region: despacho.region ?? null,
    despacho_ciudad: despacho.ciudad ?? null,
    despacho_direccion: despacho.direccion ?? null,
    despacho_numero: despacho.numero ?? null,
    despacho_depto: despacho.depto ?? null,
    despacho_codigo_sucursal: despacho.codigo_sucursal ?? null,
    despacho_nombre_sucursal: despacho.nombre_sucursal ?? null,
    despacho_ciudad_sucursal: despacho.ciudad_sucursal ?? null,
    fecha_estimada_despacho: fechaInfo.fechaDespacho.toISOString(),
    subtotal,
    costo_despacho: COSTO_DESPACHO,
    total,
  }

  const { data: pedido, error: pedidoError } = await admin
    .from('pedidos')
    .insert(pedidoData)
    .select()
    .single()

  if (pedidoError) throw pedidoError

  const itemsData = items.map((i) => {
    const precioUnitario = i.precio_unitario_override ?? i.variante?.precio ?? i.caja.precio
    return {
      pedido_id: pedido.id,
      caja_id: i.caja.id,
      caja_nombre: i.caja.nombre,
      caja_emoji: i.caja.emoji,
      precio_unitario: precioUnitario,
      cantidad: i.cantidad,
      subtotal: precioUnitario * i.cantidad,
      variante_id: i.variante?.id ?? null,
      variante_nombre: i.variante?.nombre ?? null,
      variante_sku: i.variante?.sku ?? null,
    }
  })

  const { error: itemsError } = await admin.from('items_pedido').insert(itemsData)
  if (itemsError) throw itemsError

  // registrar estado inicial en historial
  await admin.from('historial_estados').insert({
    pedido_id: pedido.id,
    campo: 'estado_comercial',
    valor_anterior: '',
    valor_nuevo: 'esperando_pago',
    nota: 'Pedido creado',
  })

  return pedido as Pedido
}

export async function getPedido(id: string): Promise<PedidoCompleto | null> {
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pedido) return null

  const [{ data: items }, { data: pagos }, { data: historial }] = await Promise.all([
    supabase.from('items_pedido').select('*').eq('pedido_id', id).order('created_at'),
    supabase.from('pagos').select('*').eq('pedido_id', id).order('created_at'),
    supabase.from('historial_estados').select('*').eq('pedido_id', id).order('created_at'),
  ])

  return {
    ...pedido,
    items: items ?? [],
    pagos: pagos ?? [],
    historial: historial ?? [],
  } as PedidoCompleto
}

export async function getPedidoPorNumero(numero: string): Promise<PedidoCompleto | null> {
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('numero', numero)
    .single()

  if (error || !pedido) return null
  return getPedido(pedido.id)
}

// Solo admin
export async function listarPedidos(opciones?: {
  estado_comercial?: EstadoComercial
  limit?: number
  offset?: number
}): Promise<{ pedidos: Pedido[]; total: number }> {
  const admin = createAdminClient()
  let query = admin
    .from('pedidos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (opciones?.estado_comercial) {
    query = query.eq('estado_comercial', opciones.estado_comercial)
  }

  const limit = opciones?.limit ?? 50
  const offset = opciones?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw error

  return { pedidos: (data ?? []) as Pedido[], total: count ?? 0 }
}

export async function actualizarEstadoComercial(
  pedidoId: string,
  nuevoEstado: EstadoComercial,
  responsable: string,
  nota?: string
): Promise<void> {
  const admin = createAdminClient()

  const { data: pedido } = await admin
    .from('pedidos')
    .select('estado_comercial')
    .eq('id', pedidoId)
    .single()

  const estadoAnterior = pedido?.estado_comercial ?? ''

  await admin
    .from('pedidos')
    .update({ estado_comercial: nuevoEstado })
    .eq('id', pedidoId)

  await admin.from('historial_estados').insert({
    pedido_id: pedidoId,
    campo: 'estado_comercial',
    valor_anterior: estadoAnterior,
    valor_nuevo: nuevoEstado,
    responsable,
    nota,
  })
}

export async function actualizarEstadoOperativo(
  pedidoId: string,
  nuevoEstado: EstadoOperativo,
  responsable: string,
  nota?: string
): Promise<void> {
  const admin = createAdminClient()

  const { data: pedido } = await admin
    .from('pedidos')
    .select('estado_operativo')
    .eq('id', pedidoId)
    .single()

  const estadoAnterior = pedido?.estado_operativo ?? ''

  await admin
    .from('pedidos')
    .update({ estado_operativo: nuevoEstado })
    .eq('id', pedidoId)

  await admin.from('historial_estados').insert({
    pedido_id: pedidoId,
    campo: 'estado_operativo',
    valor_anterior: estadoAnterior,
    valor_nuevo: nuevoEstado,
    responsable,
    nota,
  })
}

export async function aprobarPago(
  pedidoId: string,
  pagoId: string,
  responsable: string,
  observaciones?: string
): Promise<void> {
  const admin = createAdminClient()
  const ahora = new Date().toISOString()

  // Aprobar el pago
  await admin
    .from('pagos')
    .update({
      estado: 'aprobado',
      aprobado_por: responsable,
      aprobado_at: ahora,
      observaciones,
    })
    .eq('id', pagoId)

  // Recalcular fecha de despacho desde ahora
  const nuevaFecha = recalcularFechaDespacho(ahora)

  // Actualizar estados del pedido
  await admin
    .from('pedidos')
    .update({
      estado_comercial: 'pago_aprobado',
      estado_operativo: 'en_preparacion',
      fecha_estimada_despacho: nuevaFecha.fechaDespacho.toISOString(),
    })
    .eq('id', pedidoId)

  // Historial
  await admin.from('historial_estados').insert([
    {
      pedido_id: pedidoId,
      campo: 'estado_comercial',
      valor_anterior: 'pago_en_revision',
      valor_nuevo: 'pago_aprobado',
      responsable,
      nota: `Pago aprobado. ${observaciones ?? ''}`.trim(),
    },
    {
      pedido_id: pedidoId,
      campo: 'estado_operativo',
      valor_anterior: 'pendiente_autorizacion',
      valor_nuevo: 'en_preparacion',
      responsable,
      nota: `Fecha despacho recalculada: ${nuevaFecha.fechaDespachoStr}`,
    },
  ])
}

export async function rechazarPago(
  pedidoId: string,
  pagoId: string,
  responsable: string,
  observaciones: string
): Promise<void> {
  const admin = createAdminClient()

  await admin
    .from('pagos')
    .update({ estado: 'rechazado', observaciones, aprobado_por: responsable })
    .eq('id', pagoId)

  await actualizarEstadoComercial(pedidoId, 'esperando_pago', responsable, `Pago rechazado: ${observaciones}`)
}

export function generarMensajeWhatsApp(pedido: Pedido, items: ItemPedido[]): string {
  const itemsTexto = items
    .map((i) => `  ${i.caja_emoji} ${i.caja_nombre} x${i.cantidad} — $${i.subtotal.toLocaleString('es-CL')}`)
    .join('\n')

  return encodeURIComponent(
    `Hola! Acabo de hacer un pedido en RegalosParaTodos.cl 🎁\n\n` +
    `*Número de pedido:* ${pedido.numero}\n\n` +
    `*Productos:*\n${itemsTexto}\n\n` +
    `*Total:* $${pedido.total.toLocaleString('es-CL')}\n\n` +
    `Quedo a la espera de los datos de transferencia para confirmar el pago. ¡Gracias!`
  )
}

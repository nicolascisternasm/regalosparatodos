import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  const { data, error } = await createAdminClient().from('cajas').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ caja: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params

  try {
    const body = await req.json()
    const campos: Record<string, unknown> = {}

    if (body.nombre !== undefined)            campos.nombre = body.nombre.trim()
    if (body.descripcion !== undefined)       campos.descripcion = body.descripcion.trim()
    if (body.descripcion_corta !== undefined) campos.descripcion_corta = body.descripcion_corta?.trim() || null
    if (body.categoria !== undefined)         campos.categoria = body.categoria.trim()
    if (body.precio !== undefined)            campos.precio = Number(body.precio)
    if (body.precio_original !== undefined)   campos.precio_original = body.precio_original ? Number(body.precio_original) : null
    if (body.stock !== undefined)             campos.stock = Number(body.stock)
    if (body.emoji !== undefined)             campos.emoji = body.emoji
    if (body.imagen_url !== undefined)        campos.imagen_url = body.imagen_url || null
    if (body.activo !== undefined)            campos.activo = Boolean(body.activo)
    if (body.orden !== undefined)             campos.orden = Number(body.orden)
    if (body.tipo !== undefined)              campos.tipo = body.tipo
    if (body.precio_mayorista !== undefined)  campos.precio_mayorista = body.precio_mayorista ? Number(body.precio_mayorista) : null

    const { data, error } = await createAdminClient()
      .from('cajas')
      .update(campos)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, caja: data })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  const adminClient = createAdminClient()

  try {
    // Verificar si el producto tiene pedidos vinculados
    const { count } = await adminClient
      .from('items_pedido')
      .select('id', { count: 'exact', head: true })
      .eq('caja_id', id)

    if (count && count > 0) {
      // Soft delete: retirar del catálogo pero conservar historial
      await adminClient.from('cajas').update({ activo: false }).eq('id', id)
      return NextResponse.json({
        ok: true,
        tipo: 'soft',
        mensaje: `Producto retirado del catálogo (tiene ${count} pedido${count !== 1 ? 's' : ''} vinculado${count !== 1 ? 's' : ''})`,
      })
    }

    // Hard delete: sin pedidos vinculados
    const { error } = await adminClient.from('cajas').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, tipo: 'hard', mensaje: 'Producto eliminado definitivamente' })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('variantes')
    .select('*, imagenes:variantes_imagenes(*)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json({ variante: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  try {
    const body = await req.json()
    const campos: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.nombre !== undefined)      campos.nombre = body.nombre.trim()
    if (body.sku !== undefined)         campos.sku = body.sku?.trim() || null
    if (body.descripcion !== undefined) campos.descripcion = body.descripcion
    if (body.precio !== undefined)      campos.precio = body.precio ? Number(body.precio) : null
    if (body.stock !== undefined)       campos.stock = Number(body.stock)
    if (body.estado !== undefined)      campos.estado = body.estado
    if (body.orden !== undefined)       campos.orden = Number(body.orden)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('variantes')
      .update(campos)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'El SKU ya existe' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, variante: data })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  const admin = createAdminClient()

  try {
    // Verificar si tiene pedidos
    const { count } = await admin
      .from('items_pedido')
      .select('id', { count: 'exact', head: true })
      .eq('variante_id', id)

    if (count && count > 0) {
      await admin.from('variantes').update({ estado: 'archivada' }).eq('id', id)
      return NextResponse.json({ ok: true, tipo: 'archivada', mensaje: `Variante archivada (${count} pedido${count !== 1 ? 's' : ''} vinculado${count !== 1 ? 's' : ''})` })
    }

    const { error } = await admin.from('variantes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, tipo: 'eliminada' })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

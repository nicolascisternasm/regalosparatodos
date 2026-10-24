import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  try {
    const body = await req.json()
    const campos: Record<string, unknown> = {}

    if (body.nombre !== undefined)      campos.nombre = body.nombre.trim()
    if (body.descripcion !== undefined) campos.descripcion = body.descripcion
    if (body.imagen_url !== undefined)  campos.imagen_url = body.imagen_url || null
    if (body.orden !== undefined)       campos.orden = Number(body.orden)
    if (body.activo !== undefined)      campos.activo = Boolean(body.activo)

    const adminClient = createAdminClient()

    // Si cambia el nombre, actualizar también cajas que la usen
    if (body.nombre_anterior && body.nombre && body.nombre !== body.nombre_anterior) {
      await adminClient
        .from('cajas')
        .update({ categoria: body.nombre.trim() })
        .eq('categoria', body.nombre_anterior)
    }

    const { data, error } = await adminClient
      .from('categorias')
      .update(campos)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, categoria: data })
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
    const { data: cat } = await adminClient.from('categorias').select('nombre').eq('id', id).single()
    if (!cat) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    const { count } = await adminClient
      .from('cajas')
      .select('id', { count: 'exact', head: true })
      .eq('categoria', cat.nombre)

    if (count && count > 0) {
      return NextResponse.json({
        error: `No se puede eliminar: ${count} caja${count !== 1 ? 's' : ''} usa${count === 1 ? '' : 'n'} esta categoría. Reasígnalas primero.`,
      }, { status: 409 })
    }

    const { error } = await adminClient.from('categorias').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

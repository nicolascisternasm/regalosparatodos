import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const cajaId = req.nextUrl.searchParams.get('caja_id')
  if (!cajaId) return NextResponse.json({ error: 'caja_id requerido' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('variantes')
    .select('*, imagenes:variantes_imagenes(*)')
    .eq('caja_id', cajaId)
    .order('orden', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ variantes: data ?? [] })
}

export async function POST(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  try {
    const body = await req.json()
    const { caja_id, nombre, sku, descripcion, precio, stock, estado, orden } = body

    if (!caja_id || !nombre?.trim()) {
      return NextResponse.json({ error: 'caja_id y nombre son requeridos' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verificar que la caja sea de tipo 'variantes'
    const { data: caja } = await admin.from('cajas').select('tipo').eq('id', caja_id).single()
    if (!caja || caja.tipo !== 'variantes') {
      return NextResponse.json({ error: 'La caja debe ser de tipo variantes' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('variantes')
      .insert({
        caja_id,
        nombre: nombre.trim(),
        sku: sku?.trim() || null,
        descripcion: descripcion ?? null,
        precio: precio ? Number(precio) : null,
        stock: Number(stock ?? 0),
        estado: estado ?? 'borrador',
        orden: Number(orden ?? 0),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'El SKU ya existe' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, variante: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear variante' }, { status: 500 })
  }
}

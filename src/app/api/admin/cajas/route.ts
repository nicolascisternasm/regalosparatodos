import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { data, error } = await createAdminClient()
    .from('cajas')
    .select('*')
    .order('orden', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cajas: data })
}

export async function POST(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  try {
    const body = await req.json()
    const { nombre, descripcion, categoria, precio, precio_original, stock, emoji, imagen_url, activo, orden } = body

    if (!nombre || !descripcion || !categoria || !precio) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const { data, error } = await createAdminClient()
      .from('cajas')
      .insert([{
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria.trim(),
        precio: Number(precio),
        precio_original: precio_original ? Number(precio_original) : null,
        stock: Number(stock ?? 0),
        emoji: emoji || '🎁',
        imagen_url: imagen_url || null,
        activo: activo ?? true,
        orden: Number(orden ?? 0),
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, caja: data })
  } catch (err) {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}

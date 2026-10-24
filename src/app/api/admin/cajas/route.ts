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
    const { nombre, descripcion, descripcion_corta, categoria, precio, precio_original, precio_mayorista, stock, emoji, imagen_url, activo, orden, tipo } = body

    if (!nombre || !descripcion || !categoria) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }
    const tipoFinal = tipo === 'variantes' ? 'variantes' : 'simple'
    if (tipoFinal === 'simple' && !precio) {
      return NextResponse.json({ error: 'El precio es obligatorio para productos simples' }, { status: 400 })
    }

    const { data, error } = await createAdminClient()
      .from('cajas')
      .insert([{
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        descripcion_corta: descripcion_corta?.trim() || null,
        categoria: categoria.trim(),
        precio: Number(precio ?? 1),
        precio_original: precio_original ? Number(precio_original) : null,
        precio_mayorista: precio_mayorista ? Number(precio_mayorista) : null,
        stock: Number(stock ?? 0),
        emoji: emoji || '🎁',
        imagen_url: imagen_url || null,
        activo: activo ?? true,
        orden: Number(orden ?? 0),
        tipo: tipoFinal,
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, caja: data })
  } catch (err) {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}

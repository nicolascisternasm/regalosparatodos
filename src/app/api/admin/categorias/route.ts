import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { data, error } = await createAdminClient()
    .from('categorias')
    .select('*')
    .order('orden')
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categorias: data })
}

export async function POST(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  try {
    const body = await req.json()
    const { nombre, descripcion, imagen_url, orden, activo } = body

    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const { data, error } = await createAdminClient()
      .from('categorias')
      .insert({ nombre: nombre.trim(), descripcion, imagen_url: imagen_url || null, orden: Number(orden ?? 0), activo: activo ?? true })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, categoria: data })
  } catch {
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}

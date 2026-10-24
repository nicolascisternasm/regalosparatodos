import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  const { data, error } = await createAdminClient()
    .from('variantes_imagenes')
    .select('*')
    .eq('variante_id', id)
    .order('orden', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imagenes: data ?? [] })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  const { id } = await params
  const imgId = req.nextUrl.searchParams.get('img_id')
  if (!imgId) return NextResponse.json({ error: 'img_id requerido' }, { status: 400 })

  const admin = createAdminClient()

  // Verificar que la imagen pertenece a esta variante
  const { data: img } = await admin.from('variantes_imagenes').select('id, es_principal').eq('id', imgId).eq('variante_id', id).single()
  if (!img) return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })

  const { error } = await admin.from('variantes_imagenes').delete().eq('id', imgId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Si era la principal, asignar la primera imagen restante como principal
  if (img.es_principal) {
    const { data: primera } = await admin
      .from('variantes_imagenes')
      .select('id')
      .eq('variante_id', id)
      .order('orden', { ascending: true })
      .limit(1)
      .single()
    if (primera) {
      await admin.from('variantes_imagenes').update({ es_principal: true }).eq('id', primera.id)
    }
  }

  return NextResponse.json({ ok: true })
}

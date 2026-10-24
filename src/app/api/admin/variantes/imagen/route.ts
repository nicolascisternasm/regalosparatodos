import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const varianteId = formData.get('variante_id') as string | null
    const esPrincipal = formData.get('es_principal') === 'true'

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    if (!varianteId) return NextResponse.json({ error: 'variante_id requerido' }, { status: 400 })
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF.' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'El archivo supera los 5 MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `variantes/${varianteId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const buffer = await file.arrayBuffer()
    const admin = createAdminClient()

    const { error: uploadError } = await admin.storage
      .from('productos')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: publicUrl } = admin.storage.from('productos').getPublicUrl(filename)

    // Calcular orden (siguiente en la variante)
    const { count } = await admin
      .from('variantes_imagenes')
      .select('id', { count: 'exact', head: true })
      .eq('variante_id', varianteId)

    const orden = count ?? 0

    // Si es primera imagen o se marca como principal: quitar principal de las otras
    const esFirst = orden === 0
    if (esPrincipal || esFirst) {
      await admin
        .from('variantes_imagenes')
        .update({ es_principal: false })
        .eq('variante_id', varianteId)
    }

    const { data: img, error: insertError } = await admin
      .from('variantes_imagenes')
      .insert({
        variante_id: varianteId,
        url: publicUrl.publicUrl,
        es_principal: esPrincipal || esFirst,
        orden,
      })
      .select()
      .single()

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    return NextResponse.json({ ok: true, imagen: img })
  } catch {
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}

// Marcar una imagen como principal
export async function PATCH(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  try {
    const { img_id, variante_id } = await req.json()
    if (!img_id || !variante_id) return NextResponse.json({ error: 'img_id y variante_id requeridos' }, { status: 400 })

    const admin = createAdminClient()
    await admin.from('variantes_imagenes').update({ es_principal: false }).eq('variante_id', variante_id)
    await admin.from('variantes_imagenes').update({ es_principal: true }).eq('id', img_id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

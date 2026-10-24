import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth, noAutorizado } from '@/lib/adminAuth'

const BUCKET = 'productos'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return noAutorizado()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Use JPG, PNG, WebP o GIF' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo supera el límite de 5 MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.type.split('/')[1] || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const adminClient = createAdminClient()

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error subiendo imagen:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = adminClient.storage.from(BUCKET).getPublicUrl(filename)
    return NextResponse.json({ ok: true, url: urlData.publicUrl, filename })
  } catch (err) {
    console.error('Error en upload de imagen:', err)
    return NextResponse.json({ error: 'Error al procesar imagen' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verificarAdminAuth } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('configuracion')
    .select('clave, valor, descripcion')
    .order('clave')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Convertir array a objeto { clave: valor }
  const config: Record<string, string> = {}
  for (const row of data ?? []) config[row.clave] = row.valor

  return NextResponse.json({ config })
}

export async function PUT(req: NextRequest) {
  const auth = await verificarAdminAuth(req)
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const body: Record<string, string> = await req.json()

  const updates = Object.entries(body).map(([clave, valor]) => ({
    clave,
    valor,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await admin
    .from('configuracion')
    .upsert(updates, { onConflict: 'clave' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

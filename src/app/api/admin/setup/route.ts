import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// Ruta privada para crear la primera cuenta administradora.
// Protegida con ADMIN_SECRET_TOKEN (server-only env var).
// Solo crea si NO existe ningún admin todavía.
export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'email y password son requeridos' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verificar que no exista ningún admin (protección de setup único)
    const { data: existing } = await adminClient.auth.admin.listUsers({ perPage: 100 })
    const adminExists = existing?.users?.some(u => u.app_metadata?.role === 'admin')
    if (adminExists) {
      return NextResponse.json({ error: 'Ya existe una cuenta administradora. No se creó otra.' }, { status: 409 })
    }

    // Crear usuario con role admin en app_metadata
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      app_metadata: { role: 'admin' },
      email_confirm: true,
    })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      mensaje: 'Cuenta administradora creada. Ya puedes iniciar sesión en /admin/login',
      id: data.user?.id,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error en setup admin:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

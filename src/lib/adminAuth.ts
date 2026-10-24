import { createAdminClient } from './supabase'
import { NextRequest } from 'next/server'

export interface AdminAuthResult {
  ok: boolean
  userId?: string
  email?: string
}

export async function verificarAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return { ok: false }

  const token = auth.slice(7)
  try {
    const { data: { user }, error } = await createAdminClient().auth.getUser(token)
    if (error || !user) return { ok: false }
    if (user.app_metadata?.role !== 'admin') return { ok: false }
    return { ok: true, userId: user.id, email: user.email }
  } catch {
    return { ok: false }
  }
}

export function noAutorizado() {
  return Response.json({ error: 'No autorizado' }, { status: 401 })
}

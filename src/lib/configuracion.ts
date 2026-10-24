import { createAdminClient } from './supabase'

let cache: Record<string, string> | null = null
let cacheTs = 0
const CACHE_TTL = 60_000 // 1 minuto

export async function getConfig(): Promise<Record<string, string>> {
  if (cache && Date.now() - cacheTs < CACHE_TTL) return cache

  const admin = createAdminClient()
  const { data } = await admin.from('configuracion').select('clave, valor')

  const result: Record<string, string> = {
    // Fallbacks desde env vars
    supervisor_nombre: 'Supervisor',
    supervisor_whatsapp: process.env.WHATSAPP_SUPERVISOR ?? '56963520658',
    vendedora_nombre: 'Sofía',
    vendedora_whatsapp: '',
    vendedora_descripcion: '',
  }

  for (const row of data ?? []) {
    if (row.valor) result[row.clave] = row.valor
  }

  cache = result
  cacheTs = Date.now()
  return result
}

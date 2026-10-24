import { NextRequest, NextResponse } from 'next/server'
import { listarPedidos } from '@/lib/pedidos'
import type { EstadoComercial } from '@/types'
import { verificarAdminAuth } from '@/lib/adminAuth'

async function verificarAdmin(req: NextRequest): Promise<boolean> {
  const result = await verificarAdminAuth(req)
  return result.ok
}

export async function GET(req: NextRequest) {
  if (!await verificarAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado') as EstadoComercial | null
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  try {
    const resultado = await listarPedidos({ estado_comercial: estado ?? undefined, limit, offset })
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error listando pedidos:', error)
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { listarPedidos } from '@/lib/pedidos'
import type { EstadoComercial } from '@/types'

function verificarAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET_TOKEN
}

export async function GET(req: NextRequest) {
  if (!verificarAdmin(req)) {
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

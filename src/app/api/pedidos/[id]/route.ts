import { NextRequest, NextResponse } from 'next/server'
import { getPedido } from '@/lib/pedidos'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pedido = await getPedido(id)
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }
  return NextResponse.json({ pedido })
}

import { NextRequest, NextResponse } from 'next/server'
import { crearPedido } from '@/lib/pedidos'
import type { CrearPedidoInput } from '@/lib/pedidos'

export async function POST(req: NextRequest) {
  try {
    const body: CrearPedidoInput = await req.json()

    if (!body.items?.length) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }
    if (!body.comprador?.nombre || !body.comprador?.email || !body.comprador?.telefono) {
      return NextResponse.json({ error: 'Datos del comprador incompletos' }, { status: 400 })
    }
    // Si no viene destinatario, usar datos del comprador (pedido para uno mismo)
    if (!body.destinatario?.nombre) {
      body.destinatario = {
        nombre: body.comprador.nombre,
        telefono: body.comprador.telefono,
        mensaje_tarjeta: '',
      }
    }

    const pedido = await crearPedido(body)
    return NextResponse.json({ pedido }, { status: 201 })
  } catch (error) {
    console.error('Error creando pedido:', error)
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 })
  }
}

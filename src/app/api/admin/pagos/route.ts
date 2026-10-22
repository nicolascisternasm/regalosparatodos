import { NextRequest, NextResponse } from 'next/server'
import { aprobarPago, rechazarPago } from '@/lib/pedidos'

function verificarAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET_TOKEN
}

export async function POST(req: NextRequest) {
  if (!verificarAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { accion, pedido_id, pago_id, responsable, observaciones } = await req.json()

    if (!pedido_id || !pago_id || !responsable) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    if (accion === 'aprobar') {
      await aprobarPago(pedido_id, pago_id, responsable, observaciones)
      return NextResponse.json({ ok: true, mensaje: 'Pago aprobado' })
    }

    if (accion === 'rechazar') {
      if (!observaciones) {
        return NextResponse.json({ error: 'Debe indicar motivo del rechazo' }, { status: 400 })
      }
      await rechazarPago(pedido_id, pago_id, responsable, observaciones)
      return NextResponse.json({ ok: true, mensaje: 'Pago rechazado' })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error procesando pago:', error)
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getPedido } from '@/lib/pedidos'
import { enviarConfirmacionComprobante } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  try {
    const formData = await req.formData()
    const archivo = formData.get('archivo') as File | null

    if (!archivo) {
      return NextResponse.json({ error: 'No se recibió el archivo' }, { status: 400 })
    }

    const pedido = await getPedido(id)
    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Subir a Supabase Storage
    const ext = archivo.name.split('.').pop() ?? 'jpg'
    const path = `${id}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await archivo.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from('comprobantes')
      .upload(path, buffer, { contentType: archivo.type, upsert: false })

    if (uploadError) {
      console.error('Storage error:', uploadError)
      return NextResponse.json({ error: 'Error al subir el archivo. Verifica que el bucket "comprobantes" exista en Supabase Storage.' }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('comprobantes').getPublicUrl(path)

    // Registrar pago
    const { data: pago, error: pagoError } = await admin
      .from('pagos')
      .insert({
        pedido_id: id,
        metodo: 'transferencia',
        monto: pedido.total,
        estado: 'pendiente',
        comprobante_url: publicUrl,
      })
      .select()
      .single()

    if (pagoError) throw pagoError

    // Actualizar estado del pedido
    await admin
      .from('pedidos')
      .update({ estado_comercial: 'pago_en_revision' })
      .eq('id', id)

    await admin.from('historial_estados').insert({
      pedido_id: id,
      campo: 'estado_comercial',
      valor_anterior: 'esperando_pago',
      valor_nuevo: 'pago_en_revision',
      nota: `Comprobante subido. URL: ${publicUrl}`,
    })

    // Enviar email al comprador (y supervisor si EMAIL_SUPERVISOR configurado)
    await enviarConfirmacionComprobante(pedido, publicUrl).catch((e) =>
      console.error('Error enviando email:', e)
    )

    // Generar mensaje para WhatsApp del supervisor
    const itemsTexto = pedido.items
      .map((i) => `• ${i.caja_emoji} ${i.caja_nombre}${i.variante_nombre ? ` – ${i.variante_nombre}` : ''} ×${i.cantidad}`)
      .join('\n')

    const mensajeWA = encodeURIComponent(
      `🔔 *Nuevo comprobante de pago*\n\n` +
      `*Pedido:* ${pedido.numero}\n` +
      `*Cliente:* ${pedido.comprador_nombre}\n` +
      `*Email:* ${pedido.comprador_email}\n` +
      `*Teléfono:* ${pedido.comprador_telefono}\n\n` +
      `*Productos:*\n${itemsTexto}\n\n` +
      `*Total:* $${pedido.total.toLocaleString('es-CL')}\n\n` +
      `Ver comprobante: ${publicUrl}`
    )

    const supervisorNum = process.env.WHATSAPP_SUPERVISOR ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '56900000000'
    const waUrl = `https://wa.me/${supervisorNum}?text=${mensajeWA}`

    return NextResponse.json({ ok: true, pago_id: pago.id, wa_url: waUrl })
  } catch (error) {
    console.error('Error procesando comprobante:', error)
    return NextResponse.json({ error: 'Error al procesar el comprobante' }, { status: 500 })
  }
}

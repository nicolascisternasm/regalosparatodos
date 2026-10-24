import type { PedidoCompleto } from '@/types'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'RegalosParaTodos <notificaciones@regalosparatodos.cl>'
const EMAIL_SUPERVISOR = process.env.EMAIL_SUPERVISOR

export async function enviarConfirmacionComprobante(
  pedido: PedidoCompleto,
  comprobanteUrl: string
): Promise<void> {
  if (!RESEND_API_KEY) return // No configurado todavía

  const itemsHtml = pedido.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${i.caja_emoji} ${i.caja_nombre}${i.variante_nombre ? ` – ${i.variante_nombre}` : ''} ×${i.cantidad}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700">$${i.subtotal.toLocaleString('es-CL')}</td>
        </tr>`
    )
    .join('')

  const bodyComprador = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#222">
      <div style="background:#1a1a1a;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">🎁 ¡Comprobante recibido!</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px">
        <p>Hola <strong>${pedido.comprador_nombre}</strong>,</p>
        <p>Recibimos tu comprobante de pago para el pedido <strong>${pedido.numero}</strong>. Lo revisaremos a la brevedad y te confirmaremos el despacho.</p>
        <h3 style="margin-bottom:8px">Resumen de tu pedido</h3>
        <table style="width:100%;border-collapse:collapse">
          ${itemsHtml}
          <tr><td colspan="2" style="padding:4px 0"></td></tr>
          <tr>
            <td style="padding:4px 0;color:#666">Despacho Starken</td>
            <td style="padding:4px 0;text-align:right;color:#666">$${pedido.costo_despacho.toLocaleString('es-CL')}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:800;font-size:16px">Total</td>
            <td style="padding:8px 0;font-weight:800;font-size:16px;text-align:right">$${pedido.total.toLocaleString('es-CL')}</td>
          </tr>
        </table>
        <p style="margin-top:24px;font-size:13px;color:#666">Fecha estimada de despacho: <strong>${new Date(pedido.fecha_estimada_despacho).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
        <p style="font-size:13px;color:#888">¿Tienes dudas? Escríbenos por WhatsApp.</p>
      </div>
    </div>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [pedido.comprador_email],
      subject: `✅ Comprobante recibido — Pedido ${pedido.numero}`,
      html: bodyComprador,
      attachments: [{ filename: 'comprobante.jpg', path: comprobanteUrl }],
    }),
  })

  // Email al supervisor si está configurado
  if (EMAIL_SUPERVISOR) {
    const itemsTexto = pedido.items
      .map((i) => `• ${i.caja_emoji} ${i.caja_nombre}${i.variante_nombre ? ` – ${i.variante_nombre}` : ''} ×${i.cantidad} = $${i.subtotal.toLocaleString('es-CL')}`)
      .join('<br>')

    const bodySupervisor = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#222">
        <div style="background:#2b0a1a;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">🔔 Nuevo comprobante de pago</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px">
          <p><strong>Pedido:</strong> ${pedido.numero}</p>
          <p><strong>Cliente:</strong> ${pedido.comprador_nombre} (${pedido.comprador_email} / ${pedido.comprador_telefono})</p>
          <p><strong>Productos:</strong><br>${itemsTexto}</p>
          <p><strong>Total:</strong> $${pedido.total.toLocaleString('es-CL')}</p>
          <p><strong>Comprobante adjunto.</strong> Verificar y aprobar en el panel admin.</p>
        </div>
      </div>`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [EMAIL_SUPERVISOR],
        subject: `🔔 Comprobante recibido — ${pedido.numero} — $${pedido.total.toLocaleString('es-CL')}`,
        html: bodySupervisor,
        attachments: [{ filename: 'comprobante.jpg', path: comprobanteUrl }],
      }),
    })
  }
}

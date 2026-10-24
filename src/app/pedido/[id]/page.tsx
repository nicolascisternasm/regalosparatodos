'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { PedidoCompleto } from '@/types'
import { generarMensajeWhatsApp } from '@/lib/pedidos'

const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '56912345678'

export default function PedidoConfirmadoPage() {
  const { id } = useParams<{ id: string }>()
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [whatsappAbierto, setWhatsappAbierto] = useState(false)

  useEffect(() => {
    fetch(`/api/pedidos/${id}`)
      .then((r) => r.json())
      .then(({ pedido }) => setPedido(pedido ?? null))
      .finally(() => setCargando(false))
  }, [id])

  function abrirWhatsApp() {
    if (!pedido) return
    const mensaje = generarMensajeWhatsApp(pedido, pedido.items)
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}`
    window.open(url, '_blank')
    setWhatsappAbierto(true)
  }

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-4xl animate-bounce">🎁</div>
      </main>
    )
  }

  if (!pedido) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <p className="font-700" style={{ color: 'var(--fg)' }}>Pedido no encontrado.</p>
        <a href="/" className="mt-4 underline" style={{ color: 'var(--gold)' }}>Volver al inicio</a>
      </main>
    )
  }

  const fechaDespacho = new Date(pedido.fecha_estimada_despacho).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <main className="min-h-screen py-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-900 mb-2" style={{ color: 'var(--fg)' }}>¡Pedido registrado!</h1>
          <p style={{ color: 'var(--muted)' }}>Ahora envíanos un WhatsApp para coordinar el pago.</p>
        </div>

        {/* Número de pedido */}
        <div className="rounded-2xl p-5 mb-4 text-center" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
          <p className="text-xs font-600 uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Número de pedido</p>
          <p className="text-2xl font-900" style={{ color: 'var(--fg)' }}>{pedido.numero}</p>
        </div>

        {/* Resumen */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
          <h3 className="font-800 mb-3" style={{ color: 'var(--fg)' }}>Tu pedido</h3>
          {pedido.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--fg)' }}>{item.caja_emoji} {item.caja_nombre} ×{item.cantidad}</span>
              <span className="font-700" style={{ color: 'var(--fg)' }}>${item.subtotal.toLocaleString('es-CL')}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-900 text-lg">
            <span style={{ color: 'var(--fg)' }}>Total</span>
            <span style={{ color: 'var(--fg)' }}>${pedido.total.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Despacho */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: '#FFF0F3', border: '1.5px solid var(--border)' }}>
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--fg)' }}>📅 Fecha estimada de despacho</p>
          <p className="font-800 capitalize" style={{ color: 'var(--gold)' }}>{fechaDespacho}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Sujeto a confirmación del pago. Despacho desde Talagante vía Starken.
          </p>
        </div>

        {/* Botón WhatsApp */}
        <button
          onClick={abrirWhatsApp}
          className="w-full py-4 rounded-full font-900 text-base flex items-center justify-center gap-3 mb-3"
          style={{ background: '#25D366', color: '#fff' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {whatsappAbierto ? 'Abrir WhatsApp nuevamente' : 'Enviar pedido por WhatsApp'}
        </button>

        {whatsappAbierto && (
          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            Te enviaremos los datos bancarios por WhatsApp. Guarda tu número de pedido.
          </p>
        )}

        <a href="/catalogo" className="block text-center text-sm mt-4 underline" style={{ color: 'var(--muted)' }}>
          Seguir comprando
        </a>
      </div>
    </main>
  )
}

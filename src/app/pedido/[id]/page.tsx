'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import type { PedidoCompleto } from '@/types'

const WHATSAPP_SUPERVISOR = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '56900000000'

export default function PedidoConfirmadoPage() {
  const { id } = useParams<{ id: string }>()
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null)
  const [cargando, setCargando] = useState(true)

  // Upload states
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/pedidos/${id}`)
      .then((r) => r.json())
      .then(({ pedido }) => setPedido(pedido ?? null))
      .finally(() => setCargando(false))
  }, [id])

  function onArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setArchivo(f)
    setPreview(URL.createObjectURL(f))
  }

  async function enviarComprobante() {
    if (!archivo || !pedido) return
    setEnviando(true)
    setErrorEnvio('')

    try {
      const fd = new FormData()
      fd.append('archivo', archivo)

      const res = await fetch(`/api/pedidos/${id}/comprobante`, { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setErrorEnvio(data.error ?? 'Error al enviar')
        setEnviando(false)
        return
      }

      setEnviado(true)

      // Abrir WhatsApp al supervisor automáticamente
      if (data.wa_url) {
        setTimeout(() => window.open(data.wa_url, '_blank'), 800)
      }
    } catch {
      setErrorEnvio('Error de conexión. Intenta de nuevo.')
      setEnviando(false)
    }
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
        <p className="font-700 text-lg mb-2" style={{ color: 'var(--fg)' }}>Pedido no encontrado.</p>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Verifica el enlace o vuelve al inicio.</p>
        <a href="/" className="px-6 py-3 rounded-full font-700" style={{ background: 'var(--dark-bg)', color: '#fff' }}>Volver al inicio</a>
      </main>
    )
  }

  const fechaDespacho = new Date(pedido.fecha_estimada_despacho).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // Pantalla de agradecimiento post-envío
  if (enviado) {
    return (
      <main className="min-h-screen py-16 px-4 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="max-w-lg mx-auto w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-900 mb-3" style={{ color: 'var(--fg)' }}>¡Muchas gracias por tu compra!</h1>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            Tu comprobante fue recibido y se envió una confirmación a <strong>{pedido.comprador_email}</strong> con el detalle de tu pedido y el comprobante adjunto.
          </p>

          <div className="rounded-2xl p-5 mb-4 text-left" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E8FFF0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="font-700 text-sm" style={{ color: 'var(--fg)' }}>Email de confirmación enviado</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{pedido.comprador_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E8FFF0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <p className="font-700 text-sm" style={{ color: 'var(--fg)' }}>WhatsApp enviado al supervisor</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>El pedido comenzará a prepararse una vez aprobado el pago</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 mb-6 text-left" style={{ background: '#FFF9E8', border: '1px solid #F5D87A' }}>
            <p className="text-sm font-700 mb-1" style={{ color: '#7A5800' }}>📅 Fecha estimada de despacho</p>
            <p className="font-800 capitalize" style={{ color: '#7A5800' }}>{fechaDespacho}</p>
            <p className="text-xs mt-1" style={{ color: '#A07000' }}>Sujeto a aprobación del pago. Despacho desde Talagante vía Starken.</p>
          </div>

          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
            Número de pedido: <strong>{pedido.numero}</strong>
          </p>

          <a href="/catalogo" className="inline-block px-6 py-3 rounded-full font-700 text-sm" style={{ background: 'var(--dark-bg)', color: '#fff' }}>
            Seguir comprando
          </a>
        </div>
      </main>
    )
  }

  // Pantalla principal: resumen + upload comprobante
  return (
    <main className="min-h-screen py-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-2xl font-900 mb-2" style={{ color: 'var(--fg)' }}>¡Pedido registrado!</h1>
          <p style={{ color: 'var(--muted)' }}>Ahora adjunta tu comprobante de transferencia para confirmar el pago.</p>
        </div>

        {/* Número de pedido */}
        <div className="rounded-2xl p-5 mb-4 text-center" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
          <p className="text-xs font-600 uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Número de pedido</p>
          <p className="text-2xl font-900" style={{ color: 'var(--fg)' }}>{pedido.numero}</p>
        </div>

        {/* Resumen del pedido */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
          <h3 className="font-800 mb-3" style={{ color: 'var(--fg)' }}>Tu pedido</h3>
          {pedido.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <div>
                <span style={{ color: 'var(--fg)' }}>{item.caja_emoji} {item.caja_nombre} ×{item.cantidad}</span>
                {item.variante_nombre && <p className="text-xs" style={{ color: 'var(--muted)' }}>{item.variante_nombre}</p>}
              </div>
              <span className="font-700 flex-shrink-0 ml-3" style={{ color: 'var(--fg)' }}>${item.subtotal.toLocaleString('es-CL')}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 text-sm" style={{ color: 'var(--muted)' }}>
            <span>Despacho Starken</span><span>${pedido.costo_despacho.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex justify-between pt-3 font-900 text-lg border-t mt-2" style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}>
            <span>Total</span>
            <span>${pedido.total.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Fecha estimada */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: '#FFF9E8', border: '1px solid #F5D87A' }}>
          <p className="text-sm font-700 mb-0.5" style={{ color: '#7A5800' }}>📅 Fecha estimada de despacho</p>
          <p className="font-800 capitalize" style={{ color: '#7A5800' }}>{fechaDespacho}</p>
          <p className="text-xs mt-1" style={{ color: '#A07000' }}>Sujeto a confirmación del pago. Despacho martes y jueves desde Talagante vía Starken.</p>
        </div>

        {/* Upload comprobante */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
          <h3 className="font-800 mb-1" style={{ color: 'var(--fg)' }}>Comprobante de pago</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Adjunta la captura o foto de tu transferencia bancaria.</p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={onArchivoSeleccionado}
            style={{ display: 'none' }}
          />

          {!archivo ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--bg)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="font-600 text-sm">Tocar para adjuntar archivo</span>
              <span className="text-xs">JPG, PNG o PDF</span>
            </button>
          ) : (
            <div>
              {preview && archivo.type.startsWith('image/') && (
                <img src={preview} alt="Comprobante" className="w-full rounded-xl mb-3 object-contain max-h-48" style={{ border: '1px solid var(--border)' }} />
              )}
              {!archivo.type.startsWith('image/') && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span>📄</span><span className="text-sm font-600 truncate" style={{ color: 'var(--fg)' }}>{archivo.name}</span>
                </div>
              )}
              <button
                onClick={() => { setArchivo(null); setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
                className="text-xs underline"
                style={{ color: 'var(--muted)' }}
              >
                Cambiar archivo
              </button>
            </div>
          )}

          {errorEnvio && (
            <div className="mt-3 p-3 rounded-xl text-sm" style={{ background: '#FFF0F0', border: '1px solid #FFCCCC', color: '#CC0000' }}>
              {errorEnvio}
            </div>
          )}
        </div>

        <button
          onClick={enviarComprobante}
          disabled={!archivo || enviando}
          className="w-full py-4 rounded-full font-900 text-base mb-3 transition-all"
          style={{
            background: archivo && !enviando ? 'var(--gold)' : 'var(--border)',
            color: archivo && !enviando ? '#fff' : 'var(--muted)',
            cursor: archivo && !enviando ? 'pointer' : 'not-allowed',
          }}
        >
          {enviando ? '⏳ Enviando…' : '📤 Enviar comprobante'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          Al enviar, se notificará al equipo por WhatsApp para comenzar a preparar tu pedido.
        </p>
      </div>
    </main>
  )
}

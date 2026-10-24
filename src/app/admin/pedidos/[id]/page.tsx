'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { PedidoCompleto, EstadoComercial, EstadoOperativo } from '@/types'
import { LABEL_ESTADO_COMERCIAL, LABEL_ESTADO_OPERATIVO } from '@/types'

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? ''

const COLOR_COMERCIAL: Record<EstadoComercial, string> = {
  pendiente_confirmacion: '#856404',
  esperando_pago:         '#004085',
  pago_en_revision:       '#856404',
  pago_aprobado:          '#155724',
  cancelado:              '#721C24',
}

export default function DetallePedidoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [referencia, setReferencia] = useState('')
  const [accionActiva, setAccionActiva] = useState<'aprobar' | 'rechazar' | null>(null)

  function cargarPedido() {
    setCargando(true)
    fetch(`/api/pedidos/${id}`)
      .then((r) => r.json())
      .then(({ pedido }) => setPedido(pedido ?? null))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargarPedido() }, [id])

  async function procesarPago(accion: 'aprobar' | 'rechazar') {
    if (!pedido?.pagos?.[0]) return
    if (accion === 'rechazar' && !observaciones.trim()) {
      alert('Debes indicar el motivo del rechazo.')
      return
    }

    setProcesando(true)
    try {
      const res = await fetch('/api/admin/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
        },
        body: JSON.stringify({
          accion,
          pedido_id: pedido.id,
          pago_id: pedido.pagos[0].id,
          responsable: 'admin',
          observaciones: observaciones || referencia || undefined,
        }),
      })

      if (res.ok) {
        setAccionActiva(null)
        setObservaciones('')
        cargarPedido()
      } else {
        const data = await res.json()
        alert(data.error ?? 'Error al procesar')
      }
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return <div className="p-8 text-center" style={{ color: '#A06070' }}>Cargando pedido…</div>
  }

  if (!pedido) {
    return (
      <div className="p-8">
        <p style={{ color: '#A06070' }}>Pedido no encontrado.</p>
        <button onClick={() => router.back()} className="mt-4 underline" style={{ color: '#FF6B8A' }}>Volver</button>
      </div>
    )
  }

  const pago = pedido.pagos?.[0]
  const puedeProcesarPago = pedido.estado_comercial === 'pago_en_revision' && pago?.estado === 'pendiente'

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm mb-6 no-underline" style={{ color: '#A06070' }}>
        ← Volver a pedidos
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-900" style={{ color: '#2B0A1A' }}>{pedido.numero}</h1>
          <p className="text-sm mt-1" style={{ color: '#A06070' }}>
            {new Date(pedido.created_at).toLocaleString('es-CL')}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-xs font-600 px-2 py-1 rounded-full" style={{ background: '#FFE8F0', color: COLOR_COMERCIAL[pedido.estado_comercial] }}>
            {LABEL_ESTADO_COMERCIAL[pedido.estado_comercial]}
          </span>
          <span className="text-xs font-600 px-2 py-1 rounded-full" style={{ background: '#E8F0FF', color: '#004085' }}>
            {LABEL_ESTADO_OPERATIVO[pedido.estado_operativo]}
          </span>
        </div>
      </div>

      {/* Items */}
      <Section titulo="Productos">
        {pedido.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: '#F5D5DE' }}>
            <span style={{ color: '#2B0A1A' }}>{item.caja_emoji} {item.caja_nombre} ×{item.cantidad}</span>
            <span className="font-700" style={{ color: '#2B0A1A' }}>${item.subtotal.toLocaleString('es-CL')}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-800 text-sm">
          <span style={{ color: '#A06070' }}>Despacho</span>
          <span style={{ color: '#2B0A1A' }}>${pedido.costo_despacho.toLocaleString('es-CL')}</span>
        </div>
        <div className="flex justify-between font-900 text-lg mt-1">
          <span style={{ color: '#2B0A1A' }}>Total</span>
          <span style={{ color: '#2B0A1A' }}>${pedido.total.toLocaleString('es-CL')}</span>
        </div>
      </Section>

      {/* Comprador */}
      <Section titulo="Comprador">
        <Campo label="Nombre" valor={pedido.comprador_nombre} />
        <Campo label="Email" valor={pedido.comprador_email} />
        <Campo label="Teléfono" valor={pedido.comprador_telefono} />
      </Section>

      {/* Destinatario */}
      <Section titulo="Destinatario">
        <Campo label="Nombre" valor={pedido.destinatario_nombre} />
        <Campo label="Teléfono" valor={pedido.destinatario_telefono} />
        {pedido.mensaje_tarjeta && <Campo label="Mensaje tarjeta" valor={pedido.mensaje_tarjeta} />}
      </Section>

      {/* Despacho */}
      <Section titulo="Despacho">
        <Campo label="Tipo" valor={pedido.despacho_tipo === 'domicilio' ? '🏠 Domicilio' : '📦 Sucursal Starken'} />
        {pedido.despacho_tipo === 'domicilio' ? (
          <>
            <Campo label="Dirección" valor={[pedido.despacho_direccion, pedido.despacho_numero, pedido.despacho_depto].filter(Boolean).join(', ')} />
            <Campo label="Ciudad" valor={pedido.despacho_ciudad ?? ''} />
            <Campo label="Región" valor={pedido.despacho_region ?? ''} />
          </>
        ) : (
          <>
            <Campo label="Sucursal" valor={pedido.despacho_nombre_sucursal ?? ''} />
            <Campo label="Ciudad" valor={pedido.despacho_ciudad_sucursal ?? ''} />
          </>
        )}
        <Campo
          label="Fecha estimada despacho"
          valor={new Date(pedido.fecha_estimada_despacho).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        />
      </Section>

      {/* Gestión de pago */}
      <Section titulo="Pago">
        {!pago ? (
          <p className="text-sm" style={{ color: '#A06070' }}>Sin comprobante registrado.</p>
        ) : (
          <>
            <Campo label="Estado" valor={pago.estado} />
            {pago.referencia && <Campo label="Referencia" valor={pago.referencia} />}
            {pago.observaciones && <Campo label="Observaciones" valor={pago.observaciones} />}
            {pago.aprobado_por && <Campo label="Aprobado por" valor={`${pago.aprobado_por} — ${pago.aprobado_at ? new Date(pago.aprobado_at).toLocaleString('es-CL') : ''}`} />}
          </>
        )}

        {puedeProcesarPago && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: '#FFF0F3', border: '1.5px solid #F5D5DE' }}>
            <p className="font-700 mb-3" style={{ color: '#2B0A1A' }}>Verificar transferencia bancaria</p>
            <p className="text-sm mb-3" style={{ color: '#A06070' }}>
              Solo aprobar después de confirmar el abono en la cuenta bancaria.
            </p>
            <input
              type="text"
              placeholder="Referencia o N° comprobante (opc.)"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm mb-3 outline-none"
              style={{ border: '1.5px solid #F5D5DE', color: '#2B0A1A', background: '#fff' }}
            />
            {accionActiva === 'rechazar' && (
              <textarea
                placeholder="Motivo del rechazo (requerido)"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                className="w-full rounded-xl px-4 py-3 text-sm mb-3 outline-none resize-none"
                style={{ border: '1.5px solid #F5D5DE', color: '#2B0A1A', background: '#fff' }}
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setAccionActiva('aprobar'); procesarPago('aprobar') }}
                disabled={procesando}
                className="flex-1 py-3 rounded-full font-800 text-sm"
                style={{ background: '#22c55e', color: '#fff', opacity: procesando ? 0.7 : 1 }}
              >
                ✓ Aprobar pago
              </button>
              <button
                onClick={() => {
                  if (accionActiva === 'rechazar') { procesarPago('rechazar') }
                  else { setAccionActiva('rechazar') }
                }}
                disabled={procesando}
                className="flex-1 py-3 rounded-full font-800 text-sm"
                style={{ background: '#ef4444', color: '#fff', opacity: procesando ? 0.7 : 1 }}
              >
                ✕ {accionActiva === 'rechazar' ? 'Confirmar rechazo' : 'Rechazar'}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Historial */}
      {pedido.historial?.length > 0 && (
        <Section titulo="Historial">
          {pedido.historial.map((h) => (
            <div key={h.id} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: '#F5D5DE' }}>
              <span className="text-xs mt-0.5" style={{ color: '#A06070' }}>
                {new Date(h.created_at).toLocaleString('es-CL')}
              </span>
              <span className="text-sm flex-1" style={{ color: '#2B0A1A' }}>
                {h.nota || `${h.campo}: ${h.valor_anterior} → ${h.valor_nuevo}`}
              </span>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1.5px solid #F5D5DE' }}>
      <div className="px-4 py-3" style={{ background: '#FFF5F8', borderBottom: '1px solid #F5D5DE' }}>
        <h3 className="font-800 text-sm" style={{ color: '#2B0A1A' }}>{titulo}</h3>
      </div>
      <div className="px-4 py-3" style={{ background: '#fff' }}>
        {children}
      </div>
    </div>
  )
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="text-sm w-32 flex-shrink-0" style={{ color: '#A06070' }}>{label}</span>
      <span className="text-sm font-600" style={{ color: '#2B0A1A' }}>{valor}</span>
    </div>
  )
}

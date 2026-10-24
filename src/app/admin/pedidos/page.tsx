'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import type { Pedido, PedidoCompleto, EstadoComercial } from '@/types'
import { LABEL_ESTADO_COMERCIAL, LABEL_ESTADO_OPERATIVO } from '@/types'
import { useAdminToken } from '@/app/admin/AdminAuthContext'

// ─── colores por estado ──────────────────────────────────────────────────────

const COLOR: Record<EstadoComercial, { bg: string; color: string; border: string }> = {
  pendiente_confirmacion: { bg: '#FFF3CD', color: '#856404', border: '#F5D87A' },
  esperando_pago:         { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  pago_en_revision:       { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  pago_aprobado:          { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  cancelado:              { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
}

const COLUMNAS_KANBAN: Array<{ estado: EstadoComercial; label: string; icon: string }> = [
  { estado: 'esperando_pago',    label: 'Esperando pago',  icon: '⏳' },
  { estado: 'pago_en_revision',  label: 'En revisión',     icon: '🔍' },
  { estado: 'pago_aprobado',     label: 'Aprobados',       icon: '✅' },
  { estado: 'cancelado',         label: 'Cancelados',      icon: '❌' },
]

const FILTROS: Array<{ label: string; value: EstadoComercial | 'todos' }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Esperando pago', value: 'esperando_pago' },
  { label: 'En revisión', value: 'pago_en_revision' },
  { label: 'Aprobados', value: 'pago_aprobado' },
  { label: 'Cancelados', value: 'cancelado' },
]

// ─── componente principal ────────────────────────────────────────────────────

export default function PedidosPage() {
  const token = useAdminToken()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<EstadoComercial | 'todos'>('todos')
  const [vista, setVista] = useState<'lista' | 'kanban'>('lista')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const cargarPedidos = useCallback(() => {
    if (!token) return
    setCargando(true)
    const params = filtro !== 'todos' ? `&estado=${filtro}` : ''
    fetch(`/api/admin/pedidos?limit=200${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ pedidos, total }) => { setPedidos(pedidos ?? []); setTotal(total ?? 0) })
      .finally(() => setCargando(false))
  }, [token, filtro])

  useEffect(() => { cargarPedidos() }, [cargarPedidos])

  // Cierra modal con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-900" style={{ color: '#2B0A1A' }}>
          Pedidos <span className="text-base font-600" style={{ color: '#A06070' }}>({total})</span>
        </h1>

        {/* Selector de vista */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #F5D5DE' }}>
          {(['lista', 'kanban'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className="px-4 py-2 text-sm font-600 transition-all"
              style={{
                background: vista === v ? '#FF6B8A' : '#fff',
                color: vista === v ? '#fff' : '#A06070',
                borderRight: v === 'lista' ? '1px solid #F5D5DE' : 'none',
              }}
            >
              {v === 'lista' ? '☰ Lista' : '⊞ Kanban'}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros (solo en lista) */}
      {vista === 'lista' && (
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className="px-4 py-2 rounded-full text-sm font-600 transition-all"
              style={{
                background: filtro === f.value ? '#FF6B8A' : '#fff',
                color: filtro === f.value ? '#fff' : '#2B0A1A',
                border: `1.5px solid ${filtro === f.value ? '#FF6B8A' : '#F5D5DE'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Vista lista */}
      {vista === 'lista' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #F5D5DE' }}>
          <div style={{ background: '#fff' }}>
            {cargando ? (
              <div className="p-10 text-center" style={{ color: '#A06070' }}>Cargando…</div>
            ) : pedidos.length === 0 ? (
              <div className="p-10 text-center" style={{ color: '#A06070' }}>No hay pedidos con este filtro.</div>
            ) : (
              <>
                {/* Cabecera tabla */}
                <div
                  className="grid items-center gap-4 px-5 py-2 text-xs font-700 uppercase tracking-wider"
                  style={{ borderBottom: '1px solid #F5D5DE', color: '#A06070', gridTemplateColumns: '1fr 1fr auto auto' }}
                >
                  <span>Pedido / Fecha</span>
                  <span>Cliente</span>
                  <span>Estado</span>
                  <span className="text-right">Total</span>
                </div>
                {pedidos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className="w-full grid items-center gap-4 px-5 py-3 border-b last:border-0 transition-colors text-left"
                    style={{ borderColor: '#F5D5DE', gridTemplateColumns: '1fr 1fr auto auto' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF5F8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    <div className="min-w-0">
                      <p className="font-700 text-sm" style={{ color: '#2B0A1A' }}>{p.numero}</p>
                      <p className="text-xs" style={{ color: '#A06070' }}>
                        {new Date(p.created_at).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-600 truncate" style={{ color: '#2B0A1A' }}>{p.comprador_nombre}</p>
                      <p className="text-xs truncate" style={{ color: '#A06070' }}>{p.comprador_email}</p>
                    </div>
                    <span
                      className="text-xs font-600 px-2 py-1 rounded-full whitespace-nowrap"
                      style={COLOR[p.estado_comercial]}
                    >
                      {LABEL_ESTADO_COMERCIAL[p.estado_comercial]}
                    </span>
                    <p className="font-800 text-sm whitespace-nowrap text-right" style={{ color: '#2B0A1A' }}>
                      ${p.total.toLocaleString('es-CL')}
                    </p>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Vista kanban */}
      {vista === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
          {COLUMNAS_KANBAN.map((col) => {
            const items = pedidos.filter((p) => p.estado_comercial === col.estado)
            const c = COLOR[col.estado]
            return (
              <div key={col.estado} className="flex-shrink-0" style={{ width: 240 }}>
                {/* Cabecera columna */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-xl mb-3"
                  style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
                >
                  <span className="text-sm font-700" style={{ color: c.color }}>
                    {col.icon} {col.label}
                  </span>
                  <span className="text-xs font-800 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: c.color, color: '#fff' }}>
                    {cargando ? '…' : items.length}
                  </span>
                </div>

                {/* Tarjetas */}
                <div className="flex flex-col gap-2">
                  {cargando
                    ? [1, 2].map((i) => (
                      <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#F5D5DE' }} />
                    ))
                    : items.length === 0
                    ? (
                      <div className="px-3 py-6 text-center text-xs rounded-xl" style={{ color: '#C09090', border: '1.5px dashed #F5D5DE' }}>
                        Sin pedidos
                      </div>
                    )
                    : items.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className="w-full text-left rounded-xl px-3 py-3 transition-all"
                        style={{ background: '#fff', border: '1.5px solid #F5D5DE' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B8A'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(255,107,138,.12)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#F5D5DE'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <p className="font-800 text-xs mb-1" style={{ color: '#2B0A1A' }}>{p.numero}</p>
                        <p className="text-xs font-600 truncate mb-2" style={{ color: '#A06070' }}>{p.comprador_nombre}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: '#C09090' }}>
                            {new Date(p.created_at).toLocaleDateString('es-CL')}
                          </span>
                          <span className="font-800 text-sm" style={{ color: '#2B0A1A' }}>
                            ${p.total.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </button>
                    ))
                  }
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal detalle */}
      {selectedId && (
        <ModalDetalle
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onActualizar={() => { cargarPedidos() }}
        />
      )}
    </div>
  )
}

// ─── Modal detalle ───────────────────────────────────────────────────────────

function ModalDetalle({
  id,
  onClose,
  onActualizar,
}: {
  id: string
  onClose: () => void
  onActualizar: () => void
}) {
  const token = useAdminToken()
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [referencia, setReferencia] = useState('')
  const [accionActiva, setAccionActiva] = useState<'aprobar' | 'rechazar' | null>(null)

  const cargarDetalle = useCallback(() => {
    setCargando(true)
    fetch(`/api/pedidos/${id}`)
      .then((r) => r.json())
      .then(({ pedido }) => setPedido(pedido ?? null))
      .finally(() => setCargando(false))
  }, [id])

  useEffect(() => { cargarDetalle() }, [cargarDetalle])

  async function procesarPago(accion: 'aprobar' | 'rechazar') {
    if (!pedido?.pagos?.[0] || !token) return
    if (accion === 'rechazar' && !observaciones.trim()) {
      alert('Debes indicar el motivo del rechazo.')
      return
    }
    setProcesando(true)
    try {
      const res = await fetch('/api/admin/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        cargarDetalle()
        onActualizar()
      } else {
        const data = await res.json()
        alert(data.error ?? 'Error al procesar')
      }
    } finally {
      setProcesando(false)
    }
  }

  const pago = pedido?.pagos?.[0]
  const puedeProcesarPago = pedido?.estado_comercial === 'pago_en_revision' && pago?.estado === 'pendiente'

  return (
    /* Overlay */
    <div
      className="fixed inset-0 flex items-start justify-end"
      style={{ zIndex: 9000, background: 'rgba(43,10,26,.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel lateral */}
      <div
        className="h-full overflow-y-auto flex flex-col"
        style={{
          width: 'min(520px, 100vw)',
          background: '#FFF5F8',
          boxShadow: '-8px 0 40px rgba(43,10,26,.15)',
        }}
      >
        {/* Header fijo */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 sticky top-0"
          style={{ background: '#FFF5F8', borderBottom: '1px solid #F5D5DE', zIndex: 1 }}
        >
          {pedido ? (
            <div>
              <p className="font-900 text-base" style={{ color: '#2B0A1A' }}>{pedido.numero}</p>
              <p className="text-xs" style={{ color: '#A06070' }}>
                {new Date(pedido.created_at).toLocaleString('es-CL')}
              </p>
            </div>
          ) : (
            <p className="font-700" style={{ color: '#2B0A1A' }}>Detalle de pedido</p>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-700 transition-all"
            style={{ background: '#F5D5DE', color: '#2B0A1A' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFCCD9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F5D5DE')}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-5 flex flex-col gap-4">
          {cargando ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: '#A06070' }}>
              <div className="text-3xl animate-bounce">🎁</div>
            </div>
          ) : !pedido ? (
            <p style={{ color: '#A06070' }}>No se pudo cargar el pedido.</p>
          ) : (
            <>
              {/* Estados */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs font-600 px-3 py-1 rounded-full" style={COLOR[pedido.estado_comercial]}>
                  {LABEL_ESTADO_COMERCIAL[pedido.estado_comercial]}
                </span>
                <span className="text-xs font-600 px-3 py-1 rounded-full" style={{ background: '#E8F0FF', color: '#004085' }}>
                  {LABEL_ESTADO_OPERATIVO[pedido.estado_operativo]}
                </span>
              </div>

              {/* Productos */}
              <Seccion titulo="Productos">
                {pedido.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: '#F5D5DE' }}>
                    <div>
                      <span className="text-sm" style={{ color: '#2B0A1A' }}>{item.caja_emoji} {item.caja_nombre} ×{item.cantidad}</span>
                      {item.variante_nombre && <p className="text-xs" style={{ color: '#A06070' }}>{item.variante_nombre}</p>}
                    </div>
                    <span className="font-700 text-sm" style={{ color: '#2B0A1A' }}>${item.subtotal.toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-sm" style={{ color: '#A06070' }}>
                  <span>Despacho</span><span>${pedido.costo_despacho.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between font-900 text-lg pt-1">
                  <span style={{ color: '#2B0A1A' }}>Total</span>
                  <span style={{ color: '#2B0A1A' }}>${pedido.total.toLocaleString('es-CL')}</span>
                </div>
              </Seccion>

              {/* Comprador / Destinatario en dos columnas */}
              <div className="grid grid-cols-2 gap-3">
                <Seccion titulo="Comprador">
                  <Campo label="Nombre" valor={pedido.comprador_nombre} />
                  <Campo label="Email" valor={pedido.comprador_email} />
                  <Campo label="Teléfono" valor={pedido.comprador_telefono} />
                </Seccion>
                <Seccion titulo="Destinatario">
                  <Campo label="Nombre" valor={pedido.destinatario_nombre} />
                  <Campo label="Teléfono" valor={pedido.destinatario_telefono} />
                  {pedido.mensaje_tarjeta && <Campo label="Mensaje" valor={pedido.mensaje_tarjeta} />}
                </Seccion>
              </div>

              {/* Despacho */}
              <Seccion titulo="Despacho">
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
                  label="Despacho est."
                  valor={new Date(pedido.fecha_estimada_despacho).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                />
              </Seccion>

              {/* Pago */}
              <Seccion titulo="Pago">
                {!pago ? (
                  <p className="text-sm" style={{ color: '#A06070' }}>Sin comprobante registrado.</p>
                ) : (
                  <>
                    <Campo label="Estado" valor={pago.estado} />
                    {pago.comprobante_url && (
                      <div className="mt-2">
                        <a
                          href={pago.comprobante_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs font-700 px-3 py-1.5 rounded-full"
                          style={{ background: '#E8F0FF', color: '#1E40AF' }}
                        >
                          🔗 Ver comprobante
                        </a>
                      </div>
                    )}
                    {pago.observaciones && <Campo label="Obs." valor={pago.observaciones} />}
                    {pago.aprobado_por && (
                      <Campo label="Aprobado" valor={`${pago.aprobado_por} — ${pago.aprobado_at ? new Date(pago.aprobado_at).toLocaleString('es-CL') : ''}`} />
                    )}
                  </>
                )}

                {puedeProcesarPago && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: '#FFF0F3', border: '1.5px solid #F5D5DE' }}>
                    <p className="font-700 text-sm mb-2" style={{ color: '#2B0A1A' }}>Verificar transferencia</p>
                    <input
                      type="text"
                      placeholder="Referencia o N° (opc.)"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-sm mb-2 outline-none"
                      style={{ border: '1.5px solid #F5D5DE', color: '#2B0A1A', background: '#fff' }}
                    />
                    {accionActiva === 'rechazar' && (
                      <textarea
                        placeholder="Motivo del rechazo (requerido)"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl px-3 py-2 text-sm mb-2 outline-none resize-none"
                        style={{ border: '1.5px solid #F5D5DE', color: '#2B0A1A', background: '#fff' }}
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAccionActiva('aprobar'); procesarPago('aprobar') }}
                        disabled={procesando}
                        className="flex-1 py-2 rounded-full font-800 text-sm"
                        style={{ background: '#22c55e', color: '#fff', opacity: procesando ? 0.7 : 1 }}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => accionActiva === 'rechazar' ? procesarPago('rechazar') : setAccionActiva('rechazar')}
                        disabled={procesando}
                        className="flex-1 py-2 rounded-full font-800 text-sm"
                        style={{ background: '#ef4444', color: '#fff', opacity: procesando ? 0.7 : 1 }}
                      >
                        ✕ {accionActiva === 'rechazar' ? 'Confirmar' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                )}
              </Seccion>

              {/* Historial */}
              {pedido.historial?.length > 0 && (
                <Seccion titulo="Historial">
                  {pedido.historial.map((h) => (
                    <div key={h.id} className="flex gap-3 py-1.5 border-b last:border-0" style={{ borderColor: '#F5D5DE' }}>
                      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#C09090' }}>
                        {new Date(h.created_at).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs" style={{ color: '#2B0A1A' }}>
                        {h.nota || `${h.campo}: ${h.valor_anterior} → ${h.valor_nuevo}`}
                      </span>
                    </div>
                  ))}
                </Seccion>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #F5D5DE' }}>
      <div className="px-4 py-2" style={{ background: '#FFE8F0', borderBottom: '1px solid #F5D5DE' }}>
        <h3 className="font-800 text-xs uppercase tracking-wider" style={{ color: '#2B0A1A' }}>{titulo}</h3>
      </div>
      <div className="px-4 py-3" style={{ background: '#fff' }}>
        {children}
      </div>
    </div>
  )
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-xs w-20 flex-shrink-0" style={{ color: '#A06070' }}>{label}</span>
      <span className="text-xs font-600" style={{ color: '#2B0A1A' }}>{valor}</span>
    </div>
  )
}

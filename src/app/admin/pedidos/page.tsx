'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Pedido, EstadoComercial } from '@/types'
import { LABEL_ESTADO_COMERCIAL } from '@/types'

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? ''

const COLORES: Record<EstadoComercial, { bg: string; color: string }> = {
  pendiente_confirmacion: { bg: '#FFF3CD', color: '#856404' },
  esperando_pago:         { bg: '#CCE5FF', color: '#004085' },
  pago_en_revision:       { bg: '#FFF3CD', color: '#856404' },
  pago_aprobado:          { bg: '#D4EDDA', color: '#155724' },
  cancelado:              { bg: '#F8D7DA', color: '#721C24' },
}

const FILTROS: Array<{ label: string; value: EstadoComercial | 'todos' }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Esperando pago', value: 'esperando_pago' },
  { label: 'En revisión', value: 'pago_en_revision' },
  { label: 'Aprobados', value: 'pago_aprobado' },
  { label: 'Cancelados', value: 'cancelado' },
]

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState<EstadoComercial | 'todos'>('todos')

  useEffect(() => {
    setCargando(true)
    const params = filtro !== 'todos' ? `&estado=${filtro}` : ''
    fetch(`/api/admin/pedidos?limit=100${params}`, {
      headers: { 'x-admin-token': ADMIN_TOKEN },
    })
      .then((r) => r.json())
      .then(({ pedidos, total }) => { setPedidos(pedidos ?? []); setTotal(total ?? 0) })
      .finally(() => setCargando(false))
  }, [filtro])

  return (
    <div>
      <h1 className="text-2xl font-900 mb-6" style={{ color: '#2B0A1A' }}>Pedidos</h1>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
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

      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #F5D5DE' }}>
        <div className="px-5 py-3" style={{ background: '#fff', borderBottom: '1px solid #F5D5DE' }}>
          <p className="text-sm font-600" style={{ color: '#A06070' }}>{total} pedido{total !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ background: '#fff' }}>
          {cargando ? (
            <div className="p-8 text-center" style={{ color: '#A06070' }}>Cargando…</div>
          ) : pedidos.length === 0 ? (
            <div className="p-8 text-center" style={{ color: '#A06070' }}>No hay pedidos con este filtro.</div>
          ) : (
            pedidos.map((p) => (
              <Link
                key={p.id}
                href={`/admin/pedidos/${p.id}`}
                className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-4 px-5 py-3 border-b last:border-0 no-underline hover:bg-pink-50 transition-colors"
                style={{ borderColor: '#F5D5DE' }}
              >
                <div className="min-w-0">
                  <p className="font-700 text-sm" style={{ color: '#2B0A1A' }}>{p.numero}</p>
                  <p className="text-xs" style={{ color: '#A06070' }}>{new Date(p.created_at).toLocaleString('es-CL')}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-600 truncate" style={{ color: '#2B0A1A' }}>{p.comprador_nombre}</p>
                  <p className="text-xs truncate" style={{ color: '#A06070' }}>{p.comprador_email}</p>
                </div>
                <span
                  className="text-xs font-600 px-2 py-1 rounded-full whitespace-nowrap"
                  style={COLORES[p.estado_comercial]}
                >
                  {LABEL_ESTADO_COMERCIAL[p.estado_comercial]}
                </span>
                <p className="font-800 text-sm whitespace-nowrap" style={{ color: '#2B0A1A' }}>
                  ${p.total.toLocaleString('es-CL')}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Pedido, EstadoComercial } from '@/types'
import { LABEL_ESTADO_COMERCIAL } from '@/types'
import { useAdminToken } from '@/app/admin/AdminAuthContext'

const COLORES_ESTADO: Record<EstadoComercial, { bg: string; color: string }> = {
  pendiente_confirmacion: { bg: '#FFF3CD', color: '#856404' },
  esperando_pago:         { bg: '#CCE5FF', color: '#004085' },
  pago_en_revision:       { bg: '#FFF3CD', color: '#856404' },
  pago_aprobado:          { bg: '#D4EDDA', color: '#155724' },
  cancelado:              { bg: '#F8D7DA', color: '#721C24' },
}

export default function AdminDashboard() {
  const token = useAdminToken()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/pedidos?limit=20', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ pedidos, total }) => {
        setPedidos(pedidos ?? [])
        setTotal(total ?? 0)
      })
      .finally(() => setCargando(false))
  }, [])

  const porEstado = pedidos.reduce(
    (acc, p) => { acc[p.estado_comercial] = (acc[p.estado_comercial] ?? 0) + 1; return acc },
    {} as Record<string, number>
  )

  return (
    <div>
      <h1 className="text-2xl font-900 mb-6" style={{ color: '#2B0A1A' }}>Panel de control</h1>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(Object.keys(LABEL_ESTADO_COMERCIAL) as EstadoComercial[]).map((estado) => (
          <div key={estado} className="rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid #F5D5DE' }}>
            <p className="text-2xl font-900 mb-1" style={{ color: '#2B0A1A' }}>{porEstado[estado] ?? 0}</p>
            <p className="text-xs font-600" style={{ color: '#A06070' }}>{LABEL_ESTADO_COMERCIAL[estado]}</p>
          </div>
        ))}
      </div>

      {/* Últimos pedidos */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #F5D5DE' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#fff', borderBottom: '1px solid #F5D5DE' }}>
          <h2 className="font-800" style={{ color: '#2B0A1A' }}>Últimos pedidos ({total})</h2>
          <Link href="/admin/pedidos" className="text-sm font-600 no-underline" style={{ color: '#FF6B8A' }}>Ver todos →</Link>
        </div>
        <div style={{ background: '#fff' }}>
          {cargando ? (
            <div className="p-6 text-center" style={{ color: '#A06070' }}>Cargando…</div>
          ) : pedidos.length === 0 ? (
            <div className="p-6 text-center" style={{ color: '#A06070' }}>No hay pedidos todavía.</div>
          ) : (
            pedidos.slice(0, 10).map((p) => (
              <Link
                key={p.id}
                href={`/admin/pedidos/${p.id}`}
                className="flex items-center gap-4 px-5 py-3 border-b last:border-0 no-underline hover:bg-pink-50 transition-colors"
                style={{ borderColor: '#F5D5DE' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-700 text-sm truncate" style={{ color: '#2B0A1A' }}>{p.numero}</p>
                  <p className="text-xs truncate" style={{ color: '#A06070' }}>{p.comprador_nombre} — ${p.total.toLocaleString('es-CL')}</p>
                </div>
                <span
                  className="text-xs font-600 px-2 py-1 rounded-full whitespace-nowrap"
                  style={COLORES_ESTADO[p.estado_comercial]}
                >
                  {LABEL_ESTADO_COMERCIAL[p.estado_comercial]}
                </span>
                <span className="text-xs" style={{ color: '#A06070' }}>
                  {new Date(p.created_at).toLocaleDateString('es-CL')}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminToken } from '@/app/admin/AdminAuthContext'
import type { Caja } from '@/types'

export default function CajasAdminPage() {
  const token = useAdminToken()
  const [cajas, setCajas] = useState<Caja[]>([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')

  async function cargar() {
    if (!token) return
    setCargando(true)
    const res = await fetch('/api/admin/cajas', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const { cajas: data } = await res.json()
    setCajas(data ?? [])
    setCargando(false)
  }

  useEffect(() => {
    if (token) cargar()
  }, [token])

  async function toggleActivo(caja: Caja) {
    await fetch(`/api/admin/cajas/${caja.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !caja.activo }),
    })
    cargar()
  }

  async function handleEliminar(caja: Caja) {
    const ok = window.confirm(
      `¿Eliminar "${caja.nombre}"?\n\nSi tiene pedidos vinculados se retirará del catálogo conservando el historial.`
    )
    if (!ok) return

    setEliminando(caja.id)
    try {
      const res = await fetch(`/api/admin/cajas/${caja.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.ok) {
        setMensaje(data.mensaje)
        setTimeout(() => setMensaje(''), 4000)
        cargar()
      } else {
        alert(data.error ?? 'Error al eliminar')
      }
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-900" style={{ color: '#2B0A1A' }}>Cajas / Productos</h1>
        <Link
          href="/admin/cajas/nueva"
          style={{
            background: '#FF6B8A', color: '#fff', padding: '10px 20px',
            borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          + Nueva caja
        </Link>
      </div>

      {mensaje && (
        <div style={{ background: '#D4EDDA', color: '#155724', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {mensaje}
        </div>
      )}

      {cargando ? (
        <div className="p-8 text-center" style={{ color: '#A06070' }}>Cargando…</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #F5D5DE', overflow: 'hidden' }}>
          {cajas.length === 0 ? (
            <div className="p-8 text-center" style={{ color: '#A06070' }}>
              <p>No hay productos todavía.</p>
              <Link href="/admin/cajas/nueva" style={{ color: '#FF6B8A', fontWeight: 700 }}>Crear el primero →</Link>
            </div>
          ) : (
            cajas.map((caja, i) => (
              <div
                key={caja.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  borderBottom: i < cajas.length - 1 ? '1px solid #F5D5DE' : 'none',
                  opacity: caja.activo ? 1 : 0.55,
                  background: caja.activo ? '#fff' : '#FFF8FA',
                }}
              >
                {/* Miniatura */}
                <div style={{
                  width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(145deg, #F2F2F2 0%, #E8E8E8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {caja.imagen_url ? (
                    <img src={caja.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>{caja.emoji}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-700 text-sm" style={{ color: '#2B0A1A' }}>{caja.nombre}</p>
                    <span style={{ fontSize: 11, background: '#F5D5DE', color: '#A06070', padding: '2px 8px', borderRadius: 100 }}>
                      {caja.categoria}
                    </span>
                    {!caja.activo && (
                      <span style={{ fontSize: 11, background: '#FFF3CD', color: '#856404', padding: '2px 8px', borderRadius: 100 }}>
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#A06070' }}>
                    ${caja.precio.toLocaleString('es-CL')}
                    {caja.precio_original ? ` (antes $${caja.precio_original.toLocaleString('es-CL')})` : ''}
                    {caja.stock !== undefined ? ` · Stock: ${caja.stock}` : ''}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActivo(caja)}
                    title={caja.activo ? 'Desactivar' : 'Activar'}
                    style={{
                      padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: caja.activo ? '#D4EDDA' : '#F8D7DA',
                      color: caja.activo ? '#155724' : '#721C24',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {caja.activo ? '● Activa' : '○ Inactiva'}
                  </button>
                  <Link
                    href={`/admin/cajas/${caja.id}/editar`}
                    style={{
                      padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: '#CCE5FF', color: '#004085', textDecoration: 'none',
                    }}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleEliminar(caja)}
                    disabled={eliminando === caja.id}
                    style={{
                      padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: '#F8D7DA', color: '#721C24',
                      border: 'none', cursor: 'pointer',
                      opacity: eliminando === caja.id ? 0.5 : 1,
                    }}
                  >
                    {eliminando === caja.id ? '…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

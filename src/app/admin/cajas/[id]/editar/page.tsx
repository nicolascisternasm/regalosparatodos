'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAdminToken } from '@/app/admin/AdminAuthContext'
import CajaFormulario from '../../CajaFormulario'
import type { Caja } from '@/types'

export default function EditarCajaPage() {
  const { id } = useParams<{ id: string }>()
  const token = useAdminToken()
  const [caja, setCaja] = useState<Caja | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || !id) return
    fetch(`/api/admin/cajas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.caja) setCaja(data.caja)
        else setError(data.error ?? 'No encontrado')
      })
      .catch(() => setError('Error al cargar'))
  }, [token, id])

  if (error) {
    return (
      <div style={{ background: '#F8D7DA', color: '#721C24', padding: '12px 16px', borderRadius: 8 }}>
        {error}
      </div>
    )
  }

  if (!caja) {
    return <div style={{ color: '#A06070', padding: '2rem' }}>Cargando…</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2B0A1A', marginBottom: 24 }}>
        Editar: {caja.nombre}
      </h1>
      <CajaFormulario modo="editar" inicial={caja} cajaId={id} />
    </div>
  )
}

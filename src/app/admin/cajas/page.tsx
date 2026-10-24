'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAdminToken } from '@/app/admin/AdminAuthContext'
import type { Caja } from '@/types'

interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  imagen_url?: string
  orden: number
  activo: boolean
}

interface CategoriaEditando {
  id: string | null // null = nueva
  nombre: string
  descripcion: string
  imagen_url: string
  orden: string
}

const VACIA: CategoriaEditando = { id: null, nombre: '', descripcion: '', imagen_url: '', orden: '0' }

export default function CajasAdminPage() {
  const token = useAdminToken()
  const fileRef = useRef<HTMLInputElement>(null)

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cajas, setCajas] = useState<Caja[]>([])
  const [cargando, setCargando] = useState(true)
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set())
  const [editando, setEditando] = useState<CategoriaEditando | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [guardandoCat, setGuardandoCat] = useState(false)
  const [eliminandoCaja, setEliminandoCaja] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [errorForm, setErrorForm] = useState('')

  async function cargar() {
    if (!token) return
    setCargando(true)
    const [resCats, resCajas] = await Promise.all([
      fetch('/api/admin/categorias', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/admin/cajas', { headers: { Authorization: `Bearer ${token}` } }),
    ])
    const [{ categorias: cats }, { cajas: cjs }] = await Promise.all([resCats.json(), resCajas.json()])
    setCategorias(cats ?? [])
    setCajas(cjs ?? [])
    // Abrir todas por defecto en primera carga
    if (cats?.length) setAbiertas(new Set(cats.map((c: Categoria) => c.id)))
    setCargando(false)
  }

  useEffect(() => { if (token) cargar() }, [token])

  function toggleAbierta(id: string) {
    setAbiertas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ─── Imagen de categoría ───────────────────────────────────────────────────
  async function handleImagenCat(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editando) return
    setSubiendo(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/admin/cajas/imagen', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setEditando((prev) => prev ? { ...prev, imagen_url: result.url } : prev)
    } catch (err: unknown) {
      setErrorForm(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setSubiendo(false)
    }
  }

  // ─── Guardar categoría (crear o editar) ────────────────────────────────────
  async function guardarCategoria() {
    if (!editando) return
    setErrorForm('')
    if (!editando.nombre.trim()) { setErrorForm('El nombre es requerido'); return }
    setGuardandoCat(true)

    try {
      const payload: Record<string, unknown> = {
        nombre: editando.nombre.trim(),
        descripcion: editando.descripcion,
        imagen_url: editando.imagen_url || null,
        orden: Number(editando.orden),
        activo: true,
      }

      let res: Response
      if (editando.id) {
        // Editar: enviar también nombre_anterior para sincronizar cajas
        const catActual = categorias.find((c) => c.id === editando.id)
        payload.nombre_anterior = catActual?.nombre
        res = await fetch(`/api/admin/categorias/${editando.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/categorias', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMensaje(editando.id ? 'Categoría actualizada' : 'Categoría creada')
      setTimeout(() => setMensaje(''), 3000)
      setEditando(null)
      cargar()
    } catch (err: unknown) {
      setErrorForm(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardandoCat(false)
    }
  }

  // ─── Eliminar categoría ────────────────────────────────────────────────────
  async function eliminarCategoria(cat: Categoria) {
    const ok = window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)
    if (!ok) return
    const res = await fetch(`/api/admin/categorias/${cat.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (data.ok) {
      setMensaje('Categoría eliminada')
      setTimeout(() => setMensaje(''), 3000)
      cargar()
    } else {
      alert(data.error)
    }
  }

  // ─── Toggles y eliminación de cajas ───────────────────────────────────────
  async function toggleActivoCaja(caja: Caja) {
    await fetch(`/api/admin/cajas/${caja.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !caja.activo }),
    })
    cargar()
  }

  async function eliminarCaja(caja: Caja) {
    const ok = window.confirm(`¿Eliminar "${caja.nombre}"?\n\nSi tiene pedidos vinculados se retirará del catálogo.`)
    if (!ok) return
    setEliminandoCaja(caja.id)
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
      setEliminandoCaja(null)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const cajasPorCategoria = (nombreCat: string) =>
    cajas.filter((c) => c.categoria === nombreCat)

  const cajasSinCategoria = cajas.filter(
    (c) => !categorias.some((cat) => cat.nombre === c.categoria)
  )

  const estiloInput: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '1.5px solid #F5D5DE', borderRadius: 8,
    outline: 'none', color: '#2B0A1A', boxSizing: 'border-box', background: '#fff',
  }

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2B0A1A' }}>Categorías y Cajas</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { setEditando(VACIA); setErrorForm('') }}
            style={{ padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#F5D5DE', color: '#A06070', border: 'none', cursor: 'pointer' }}
          >
            + Nueva categoría
          </button>
          <Link
            href="/admin/cajas/nueva"
            style={{ padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#FF6B8A', color: '#fff', textDecoration: 'none' }}
          >
            + Nueva caja
          </Link>
        </div>
      </div>

      {/* Mensaje global */}
      {mensaje && (
        <div style={{ background: '#D4EDDA', color: '#155724', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {mensaje}
        </div>
      )}

      {/* Formulario inline de categoría */}
      {editando && (
        <div style={{ background: '#FFF8FA', border: '1.5px solid #F5D5DE', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2B0A1A', marginBottom: 16 }}>
            {editando.id ? 'Editar categoría' : 'Nueva categoría'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Nombre *</label>
              <input style={estiloInput} value={editando.nombre} onChange={(e) => setEditando((p) => p ? { ...p, nombre: e.target.value } : p)} placeholder="Ej: Cumpleaños" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Orden</label>
              <input type="number" min="0" style={estiloInput} value={editando.orden} onChange={(e) => setEditando((p) => p ? { ...p, orden: e.target.value } : p)} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Descripción</label>
            <textarea
              rows={2}
              style={{ ...estiloInput, resize: 'vertical' }}
              value={editando.descripcion}
              onChange={(e) => setEditando((p) => p ? { ...p, descripcion: e.target.value } : p)}
              placeholder="Breve descripción visible en el catálogo"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Imagen de la categoría</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {editando.imagen_url && (
                <div style={{ position: 'relative' }}>
                  <img src={editando.imagen_url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #F5D5DE' }} />
                  <button type="button" onClick={() => setEditando((p) => p ? { ...p, imagen_url: '' } : p)}
                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
                    ×
                  </button>
                </div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleImagenCat} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={subiendo}
                  style={{ padding: '8px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: '#F5D5DE', color: '#A06070', border: 'none', cursor: 'pointer' }}>
                  {subiendo ? 'Subiendo…' : editando.imagen_url ? '↑ Cambiar' : '↑ Subir imagen'}
                </button>
              </div>
            </div>
          </div>

          {errorForm && (
            <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12, padding: '8px 12px', background: '#FEF2F2', borderRadius: 6 }}>{errorForm}</p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={guardarCategoria} disabled={guardandoCat || subiendo}
              style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: guardandoCat ? '#F5D5DE' : '#FF6B8A', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {guardandoCat ? 'Guardando…' : 'Guardar'}
            </button>
            <button onClick={() => { setEditando(null); setErrorForm('') }}
              style={{ padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#fff', color: '#2B0A1A', border: '1.5px solid #F5D5DE', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de categorías */}
      {cargando ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#A06070' }}>Cargando…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categorias.map((cat) => {
            const cajasDeEsta = cajasPorCategoria(cat.nombre)
            const abierta = abiertas.has(cat.id)

            return (
              <div key={cat.id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #F5D5DE', overflow: 'hidden' }}>
                {/* Cabecera de categoría */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', background: abierta ? '#FFF8FA' : '#fff' }}
                  onClick={() => toggleAbierta(cat.id)}
                >
                  {/* Imagen de la categoría */}
                  <div style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #F5D5DE, #FFE5EC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.imagen_url
                      ? <img src={cat.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 24 }}>🎁</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#2B0A1A' }}>{cat.nombre}</span>
                      <span style={{ fontSize: 11, background: '#F5D5DE', color: '#A06070', padding: '2px 8px', borderRadius: 100 }}>
                        {cajasDeEsta.length} caja{cajasDeEsta.length !== 1 ? 's' : ''}
                      </span>
                      {!cat.activo && (
                        <span style={{ fontSize: 11, background: '#FFF3CD', color: '#856404', padding: '2px 8px', borderRadius: 100 }}>Inactiva</span>
                      )}
                    </div>
                    {cat.descripcion && (
                      <p style={{ fontSize: 12, color: '#A06070', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>
                        {cat.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Acciones categoría */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditando({ id: cat.id, nombre: cat.nombre, descripcion: cat.descripcion ?? '', imagen_url: cat.imagen_url ?? '', orden: String(cat.orden) }); setErrorForm('') }}
                      style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#CCE5FF', color: '#004085', border: 'none', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCategoria(cat)}
                      style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#F8D7DA', color: '#721C24', border: 'none', cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* Chevron */}
                  <span style={{ fontSize: 12, color: '#A06070', flexShrink: 0, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
                </div>

                {/* Cajas de esta categoría */}
                {abierta && (
                  <div style={{ borderTop: '1px solid #F5D5DE' }}>
                    {cajasDeEsta.length === 0 ? (
                      <div style={{ padding: '16px 20px', fontSize: 13, color: '#A06070' }}>
                        Sin cajas en esta categoría. <Link href="/admin/cajas/nueva" style={{ color: '#FF6B8A', fontWeight: 700 }}>Crear una →</Link>
                      </div>
                    ) : (
                      cajasDeEsta.map((caja, i) => (
                        <div
                          key={caja.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 12px 28px',
                            borderBottom: i < cajasDeEsta.length - 1 ? '1px solid #FFF0F3' : 'none',
                            background: caja.activo ? '#fff' : '#FFF8FA',
                            opacity: caja.activo ? 1 : 0.6,
                          }}
                        >
                          {/* Miniatura */}
                          <div style={{ width: 44, height: 44, borderRadius: 7, flexShrink: 0, background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {caja.imagen_url
                              ? <img src={caja.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontSize: 22 }}>{caja.emoji}</span>
                            }
                          </div>

                          {/* Info caja */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#2B0A1A' }}>{caja.nombre}</span>
                              {!caja.activo && <span style={{ fontSize: 11, background: '#FFF3CD', color: '#856404', padding: '1px 7px', borderRadius: 100 }}>Inactiva</span>}
                            </div>
                            <span style={{ fontSize: 12, color: '#A06070' }}>
                              ${caja.precio.toLocaleString('es-CL')}
                              {caja.stock !== undefined ? ` · Stock: ${caja.stock}` : ''}
                            </span>
                          </div>

                          {/* Acciones caja */}
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button onClick={() => toggleActivoCaja(caja)}
                              style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: caja.activo ? '#D4EDDA' : '#F8D7DA', color: caja.activo ? '#155724' : '#721C24', border: 'none', cursor: 'pointer' }}>
                              {caja.activo ? '● Activa' : '○ Inactiva'}
                            </button>
                            <Link href={`/admin/cajas/${caja.id}/editar`}
                              style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#CCE5FF', color: '#004085', textDecoration: 'none' }}>
                              Editar
                            </Link>
                            <button onClick={() => eliminarCaja(caja)} disabled={eliminandoCaja === caja.id}
                              style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#F8D7DA', color: '#721C24', border: 'none', cursor: 'pointer', opacity: eliminandoCaja === caja.id ? 0.5 : 1 }}>
                              {eliminandoCaja === caja.id ? '…' : 'Eliminar'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Cajas sin categoría reconocida */}
          {cajasSinCategoria.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px dashed #F5D5DE', overflow: 'hidden' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', background: abiertas.has('__sin__') ? '#FFF8FA' : '#fff' }}
                onClick={() => toggleAbierta('__sin__')}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: '#A06070', flex: 1 }}>Sin categoría ({cajasSinCategoria.length})</span>
                <span style={{ fontSize: 12, color: '#A06070', transform: abiertas.has('__sin__') ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
              </div>
              {abiertas.has('__sin__') && (
                <div style={{ borderTop: '1px solid #F5D5DE' }}>
                  {cajasSinCategoria.map((caja, i) => (
                    <div key={caja.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 12px 28px', borderBottom: i < cajasSinCategoria.length - 1 ? '1px solid #FFF0F3' : 'none', background: '#fff' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 7, flexShrink: 0, background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {caja.imagen_url ? <img src={caja.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>{caja.emoji}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#2B0A1A' }}>{caja.nombre}</span>
                        <span style={{ display: 'block', fontSize: 12, color: '#A06070' }}>${caja.precio.toLocaleString('es-CL')}</span>
                      </div>
                      <Link href={`/admin/cajas/${caja.id}/editar`}
                        style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#CCE5FF', color: '#004085', textDecoration: 'none' }}>
                        Editar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {categorias.length === 0 && cajas.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#A06070' }}>
              <p style={{ marginBottom: 12 }}>Aún no hay categorías ni cajas.</p>
              <button onClick={() => setEditando(VACIA)}
                style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#FF6B8A', color: '#fff', border: 'none', cursor: 'pointer', marginRight: 10 }}>
                Crear primera categoría
              </button>
              <Link href="/admin/cajas/nueva" style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#F5D5DE', color: '#A06070', textDecoration: 'none' }}>
                Crear primera caja
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

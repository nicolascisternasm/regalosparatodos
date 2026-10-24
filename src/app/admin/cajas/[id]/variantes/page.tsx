'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminToken } from '@/app/admin/AdminAuthContext'
import type { Caja, Variante, VarianteImagen } from '@/types'

type VarianteConImagenes = Variante & { imagenes: VarianteImagen[] }

const ESTADO_COLORES: Record<string, { bg: string; color: string }> = {
  borrador: { bg: '#FFF3CD', color: '#856404' },
  publicada: { bg: '#D4EDDA', color: '#155724' },
  archivada: { bg: '#F8D7DA', color: '#721C24' },
}

const CAMPOS_VACIOS = {
  nombre: '',
  sku: '',
  descripcion: '',
  precio: '',
  stock: '0',
  estado: 'borrador' as Variante['estado'],
  orden: '0',
}

export default function VariantesAdminPage() {
  const { id: cajaId } = useParams<{ id: string }>()
  const router = useRouter()
  const token = useAdminToken()
  const fileRef = useRef<HTMLInputElement>(null)

  const [caja, setCaja] = useState<Caja | null>(null)
  const [variantes, setVariantes] = useState<VarianteConImagenes[]>([])
  const [cargando, setCargando] = useState(true)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [editando, setEditando] = useState<string | 'nueva' | null>(null)
  const [form, setForm] = useState(CAMPOS_VACIOS)
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  async function cargar() {
    if (!token || !cajaId) return
    const [resCaja, resVar] = await Promise.all([
      fetch(`/api/admin/cajas/${cajaId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/admin/variantes?caja_id=${cajaId}`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
    const [{ caja: c }, { variantes: vs }] = await Promise.all([resCaja.json(), resVar.json()])
    if (!c) { router.replace('/admin/cajas'); return }
    if (c.tipo !== 'variantes') { router.replace(`/admin/cajas/${cajaId}/editar`); return }
    setCaja(c)
    setVariantes(vs ?? [])
    setCargando(false)
  }

  useEffect(() => { if (token) cargar() }, [token, cajaId])

  function iniciarNueva() {
    setForm(CAMPOS_VACIOS)
    setEditando('nueva')
    setError('')
  }

  function iniciarEditar(v: VarianteConImagenes) {
    setForm({
      nombre: v.nombre,
      sku: v.sku ?? '',
      descripcion: v.descripcion ?? '',
      precio: v.precio?.toString() ?? '',
      stock: v.stock.toString(),
      estado: v.estado,
      orden: v.orden.toString(),
    })
    setEditando(v.id)
    setExpandida(v.id)
    setError('')
  }

  async function guardar() {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setGuardando(true)
    setError('')

    const payload = {
      caja_id: cajaId,
      nombre: form.nombre.trim(),
      sku: form.sku.trim() || null,
      descripcion: form.descripcion || null,
      precio: form.precio ? Number(form.precio) : null,
      stock: Number(form.stock),
      estado: form.estado,
      orden: Number(form.orden),
    }

    try {
      let res: Response
      if (editando === 'nueva') {
        res = await fetch('/api/admin/variantes', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/variantes/${editando}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMensaje(editando === 'nueva' ? 'Variante creada' : 'Cambios guardados')
      setTimeout(() => setMensaje(''), 3000)
      setEditando(null)
      cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(v: VarianteConImagenes) {
    if (!window.confirm(`¿Eliminar "${v.nombre}"?\n\nSi tiene pedidos vinculados se archivará.`)) return
    const res = await fetch(`/api/admin/variantes/${v.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (data.ok) {
      setMensaje(data.mensaje ?? 'Eliminada')
      setTimeout(() => setMensaje(''), 3000)
      cargar()
    } else {
      alert(data.error)
    }
  }

  async function subirImagen(varianteId: string, file: File) {
    setSubiendo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('variante_id', varianteId)
      const res = await fetch('/api/admin/variantes/imagen', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMensaje('Imagen subida')
      setTimeout(() => setMensaje(''), 2000)
      cargar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setSubiendo(false)
    }
  }

  async function eliminarImagen(varianteId: string, imgId: string) {
    if (!window.confirm('¿Eliminar esta imagen?')) return
    await fetch(`/api/admin/variantes/${varianteId}/imagenes?img_id=${imgId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    cargar()
  }

  async function marcarPrincipal(imgId: string, varianteId: string) {
    await fetch('/api/admin/variantes/imagen', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ img_id: imgId, variante_id: varianteId }),
    })
    cargar()
  }

  const estiloInput: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '1.5px solid #F5D5DE', borderRadius: 8,
    outline: 'none', color: '#2B0A1A', boxSizing: 'border-box', background: '#fff',
  }

  if (cargando) return <div style={{ padding: '3rem', color: '#A06070' }}>Cargando…</div>
  if (!caja) return null

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Link href="/admin/cajas" style={{ fontSize: 13, color: '#A06070', textDecoration: 'none' }}>← Cajas</Link>
        <span style={{ color: '#F5D5DE' }}>›</span>
        <Link href={`/admin/cajas/${cajaId}/editar`} style={{ fontSize: 13, color: '#A06070', textDecoration: 'none' }}>{caja.nombre}</Link>
        <span style={{ color: '#F5D5DE' }}>›</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#2B0A1A', margin: 0 }}>Variantes</h1>
        <button
          onClick={iniciarNueva}
          style={{ marginLeft: 'auto', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#FF6B8A', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + Nueva variante
        </button>
      </div>

      {mensaje && <div style={{ background: '#D4EDDA', color: '#155724', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{mensaje}</div>}

      {/* Formulario nueva variante */}
      {editando === 'nueva' && (
        <FormVariante
          titulo="Nueva variante"
          form={form}
          setForm={setForm}
          error={error}
          guardando={guardando}
          onGuardar={guardar}
          onCancelar={() => { setEditando(null); setError('') }}
          estiloInput={estiloInput}
        />
      )}

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {variantes.length === 0 && editando !== 'nueva' && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#A06070' }}>
            <p style={{ marginBottom: 12 }}>Aún no hay variantes.</p>
            <button onClick={iniciarNueva} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#FF6B8A', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Crear primera variante
            </button>
          </div>
        )}

        {variantes.map((v) => {
          const abierta = expandida === v.id
          const estados = ESTADO_COLORES[v.estado] ?? ESTADO_COLORES.borrador
          const imgPrincipal = v.imagenes?.find((i) => i.es_principal) ?? v.imagenes?.[0]

          return (
            <div key={v.id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #F5D5DE', overflow: 'hidden' }}>
              {/* Cabecera fila */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: abierta ? '#FFF8FA' : '#fff' }}
                onClick={() => setExpandida(abierta ? null : v.id)}
              >
                {/* Miniatura */}
                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#F2F2F2', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imgPrincipal
                    ? <img src={imgPrincipal.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: 20 }}>🎁</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2B0A1A' }}>{v.nombre}</span>
                    {v.sku && <span style={{ fontSize: 11, background: '#E8E8E8', color: '#666', padding: '1px 7px', borderRadius: 100 }}>{v.sku}</span>}
                    <span style={{ fontSize: 11, background: estados.bg, color: estados.color, padding: '1px 7px', borderRadius: 100, fontWeight: 600 }}>{v.estado}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#A06070', marginTop: 2, display: 'flex', gap: 12 }}>
                    {v.precio ? <span>${v.precio.toLocaleString('es-CL')}</span> : <span style={{ color: '#DC2626' }}>Sin precio</span>}
                    <span>Stock: {v.stock}</span>
                    <span>{v.imagenes?.length ?? 0} foto{(v.imagenes?.length ?? 0) !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => iniciarEditar(v)}
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#CCE5FF', color: '#004085', border: 'none', cursor: 'pointer' }}>
                    Editar
                  </button>
                  <button onClick={() => eliminar(v)}
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#F8D7DA', color: '#721C24', border: 'none', cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </div>
                <span style={{ fontSize: 11, color: '#A06070', flexShrink: 0, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
              </div>

              {/* Panel expandido */}
              {abierta && (
                <div style={{ borderTop: '1px solid #F5D5DE', padding: '16px 20px' }}>

                  {/* Form edición si está activo */}
                  {editando === v.id && (
                    <FormVariante
                      titulo="Editar variante"
                      form={form}
                      setForm={setForm}
                      error={error}
                      guardando={guardando}
                      onGuardar={guardar}
                      onCancelar={() => { setEditando(null); setError('') }}
                      estiloInput={estiloInput}
                    />
                  )}

                  {/* Gestión de imágenes */}
                  <div style={{ marginTop: editando === v.id ? 20 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#2B0A1A' }}>Fotografías</p>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: '#F5D5DE', color: '#A06070', cursor: 'pointer' }}>
                        {subiendo ? 'Subiendo…' : '↑ Subir foto'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          style={{ display: 'none' }}
                          disabled={subiendo}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) subirImagen(v.id, file)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>

                    {(v.imagenes?.length ?? 0) === 0 ? (
                      <p style={{ fontSize: 12, color: '#A06070' }}>Sin fotos aún. Sube la primera para habilitar esta variante.</p>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {v.imagenes!.map((img) => (
                          <div key={img.id} style={{ position: 'relative' }}>
                            <div
                              style={{
                                width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                                border: img.es_principal ? '2.5px solid #FF6B8A' : '1.5px solid #E8E8E8',
                                background: '#F2F2F2', cursor: 'pointer',
                              }}
                              onClick={() => !img.es_principal && marcarPrincipal(img.id, v.id)}
                              title={img.es_principal ? 'Foto principal' : 'Marcar como principal'}
                            >
                              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            {img.es_principal && (
                              <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 9, background: '#FF6B8A', color: '#fff', padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>Principal</span>
                            )}
                            <button
                              onClick={() => eliminarImagen(v.id, img.id)}
                              style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: '#A06070', marginTop: 6 }}>Haz clic en una foto para marcarla como principal. JPG/PNG/WebP hasta 5 MB.</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FormVariante({
  titulo, form, setForm, error, guardando, onGuardar, onCancelar, estiloInput
}: {
  titulo: string
  form: typeof CAMPOS_VACIOS
  setForm: React.Dispatch<React.SetStateAction<typeof CAMPOS_VACIOS>>
  error: string
  guardando: boolean
  onGuardar: () => void
  onCancelar: () => void
  estiloInput: React.CSSProperties
}) {
  return (
    <div style={{ background: '#FFF8FA', border: '1.5px solid #F5D5DE', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2B0A1A', marginBottom: 14 }}>{titulo}</h2>

      {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Nombre *</label>
          <input style={estiloInput} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Cerdito Estrella" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>SKU</label>
          <input style={estiloInput} value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} placeholder="MC-CER-EST" />
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Descripción</label>
        <textarea rows={3} style={{ ...estiloInput, resize: 'vertical' }}
          value={form.descripcion}
          onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
          placeholder="Describe los elementos incluidos en esta presentación" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Precio CLP</label>
          <input type="number" min="1" style={estiloInput} value={form.precio} onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))} placeholder="14900" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Stock</label>
          <input type="number" min="0" style={estiloInput} value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Estado</label>
          <select style={estiloInput} value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value as Variante['estado'] }))}>
            <option value="borrador">Borrador</option>
            <option value="publicada">Publicada</option>
            <option value="archivada">Archivada</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2B0A1A', marginBottom: 4 }}>Orden</label>
          <input type="number" min="0" style={estiloInput} value={form.orden} onChange={(e) => setForm((p) => ({ ...p, orden: e.target.value }))} />
        </div>
      </div>

      <p style={{ fontSize: 11, color: '#A06070', marginBottom: 12 }}>
        El precio y las fotos pueden completarse en cualquier momento. Guarda en borrador y publica cuando estén listos.
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onGuardar} disabled={guardando}
          style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: guardando ? '#F5D5DE' : '#FF6B8A', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button onClick={onCancelar}
          style={{ padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#fff', color: '#2B0A1A', border: '1.5px solid #F5D5DE', cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

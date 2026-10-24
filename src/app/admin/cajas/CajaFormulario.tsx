'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminToken } from '@/app/admin/AdminAuthContext'
import type { Caja } from '@/types'

type Modo = 'nueva' | 'editar'

interface Props {
  modo: Modo
  inicial?: Partial<Caja>
  cajaId?: string
}

export default function CajaFormulario({ modo, inicial = {}, cajaId }: Props) {
  const token = useAdminToken()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [categorias, setCategorias] = useState<string[]>([])

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/categorias', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(({ categorias: cats }) => {
        if (cats) setCategorias(cats.map((c: { nombre: string }) => c.nombre))
      })
  }, [token])

  const [form, setForm] = useState({
    nombre: inicial.nombre ?? '',
    descripcion: inicial.descripcion ?? '',
    descripcion_corta: (inicial as Partial<Caja & { descripcion_corta?: string }>).descripcion_corta ?? '',
    categoria: inicial.categoria ?? '',
    precio: inicial.precio?.toString() ?? '',
    precio_original: inicial.precio_original?.toString() ?? '',
    stock: inicial.stock?.toString() ?? '0',
    emoji: inicial.emoji ?? '🎁',
    imagen_url: inicial.imagen_url ?? '',
    activo: inicial.activo ?? true,
    orden: inicial.orden?.toString() ?? '0',
    tipo: ((inicial as Record<string, unknown>).tipo as 'simple' | 'variantes') ?? 'simple',
  })

  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  function set(campo: string, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendo(true)
    setError('')
    try {
      const data = new FormData()
      data.append('file', file)

      const res = await fetch('/api/admin/cajas/imagen', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Error al subir imagen')
      set('imagen_url', result.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setSubiendo(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setExito('')
    setGuardando(true)

    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        descripcion_corta: form.descripcion_corta || null,
        categoria: form.categoria,
        precio: form.tipo === 'simple' ? Number(form.precio) : (Number(form.precio) || 1000),
        precio_original: form.precio_original ? Number(form.precio_original) : null,
        stock: Number(form.stock),
        emoji: form.emoji,
        imagen_url: form.imagen_url || null,
        activo: form.activo,
        orden: Number(form.orden),
        tipo: form.tipo,
      }

      let res: Response
      if (modo === 'nueva') {
        res = await fetch('/api/admin/cajas', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/cajas/${cajaId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')

      setExito(modo === 'nueva' ? 'Caja creada correctamente' : 'Cambios guardados correctamente')
      setTimeout(() => router.push('/admin/cajas'), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const estiloInput: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '1.5px solid #F5D5DE', borderRadius: 8,
    outline: 'none', color: '#2B0A1A', boxSizing: 'border-box',
    background: '#fff',
  }
  const estiloLabel: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#2B0A1A', marginBottom: 6,
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 680 }}>

      {error && (
        <div style={{ background: '#F8D7DA', color: '#721C24', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}
      {exito && (
        <div style={{ background: '#D4EDDA', color: '#155724', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          {exito}
        </div>
      )}

      {/* Tipo de producto */}
      <div style={{ marginBottom: 20 }}>
        <label style={estiloLabel}>Tipo de producto</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['simple', 'variantes'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('tipo', t)}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: form.tipo === t ? '#FF6B8A' : '#fff',
                color: form.tipo === t ? '#fff' : '#2B0A1A',
                border: `1.5px solid ${form.tipo === t ? '#FF6B8A' : '#F5D5DE'}`,
                cursor: 'pointer',
              }}
            >
              {t === 'simple' ? 'Producto simple' : 'Con variantes'}
            </button>
          ))}
        </div>
        {form.tipo === 'variantes' && cajaId && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: '#FFF0F5', borderRadius: 8, border: '1px solid #F5D5DE' }}>
            <p style={{ fontSize: 13, color: '#2B0A1A', margin: 0 }}>
              Este producto usa variantes.{' '}
              <Link href={`/admin/cajas/${cajaId}/variantes`} style={{ color: '#FF6B8A', fontWeight: 700 }}>
                Gestionar variantes →
              </Link>
            </p>
          </div>
        )}
        {form.tipo === 'variantes' && !cajaId && (
          <p style={{ fontSize: 12, color: '#A06070', marginTop: 8 }}>
            Guarda primero el producto para luego agregar variantes.
          </p>
        )}
      </div>

      {/* Nombre */}
      <div style={{ marginBottom: 16 }}>
        <label style={estiloLabel}>Nombre *</label>
        <input required style={estiloInput} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: Caja de Cumpleaños Deluxe" />
      </div>

      {/* Descripción corta (solo variantes) */}
      {form.tipo === 'variantes' && (
        <div style={{ marginBottom: 16 }}>
          <label style={estiloLabel}>Descripción corta (se muestra en el catálogo)</label>
          <input
            style={estiloInput}
            value={form.descripcion_corta}
            onChange={(e) => set('descripcion_corta', e.target.value)}
            placeholder="Ej: La graduación más especial, con tu peluche favorito"
          />
        </div>
      )}

      {/* Descripción */}
      <div style={{ marginBottom: 16 }}>
        <label style={estiloLabel}>Descripción {form.tipo === 'variantes' ? '(detalle completo)' : '*'}</label>
        <textarea
          required={form.tipo === 'simple'}
          rows={3}
          style={{ ...estiloInput, resize: 'vertical' }}
          value={form.descripcion}
          onChange={(e) => set('descripcion', e.target.value)}
          placeholder="Describe el contenido y la experiencia de la caja"
        />
      </div>

      {/* Categoría */}
      <div style={{ marginBottom: 16 }}>
        <label style={estiloLabel}>Categoría *</label>
        <select
          required
          style={estiloInput}
          value={form.categoria}
          onChange={(e) => set('categoria', e.target.value)}
        >
          <option value="">— Seleccionar —</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Precio / Precio original / Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={estiloLabel}>Precio CLP *</label>
          <input required type="number" min="0" style={estiloInput} value={form.precio} onChange={(e) => set('precio', e.target.value)} placeholder="15000" />
        </div>
        <div>
          <label style={estiloLabel}>Precio original (tachado)</label>
          <input type="number" min="0" style={estiloInput} value={form.precio_original} onChange={(e) => set('precio_original', e.target.value)} placeholder="20000" />
        </div>
        <div>
          <label style={estiloLabel}>Stock disponible</label>
          <input type="number" min="0" style={estiloInput} value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="0" />
        </div>
      </div>

      {/* Emoji */}
      <div style={{ marginBottom: 16 }}>
        <label style={estiloLabel}>Emoji (ícono de respaldo)</label>
        <input
          style={{ ...estiloInput, maxWidth: 120, fontSize: 22 }}
          value={form.emoji}
          onChange={(e) => set('emoji', e.target.value)}
          placeholder="🎁"
        />
      </div>

      {/* Imagen */}
      <div style={{ marginBottom: 16 }}>
        <label style={estiloLabel}>Imagen del producto</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {form.imagen_url && (
            <div style={{ position: 'relative' }}>
              <img
                src={form.imagen_url}
                alt="Vista previa"
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #F5D5DE' }}
              />
              <button
                type="button"
                onClick={() => set('imagen_url', '')}
                style={{
                  position: 'absolute', top: -8, right: -8,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#DC2626', color: '#fff', border: 'none',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          )}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleImagen}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              style={{
                padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: '#F5D5DE', color: '#A06070', border: 'none', cursor: 'pointer',
              }}
            >
              {subiendo ? 'Subiendo…' : form.imagen_url ? '↑ Cambiar imagen' : '↑ Subir imagen'}
            </button>
            <p style={{ fontSize: 12, color: '#A06070', marginTop: 6 }}>JPG, PNG, WebP hasta 5 MB</p>
          </div>
        </div>
      </div>

      {/* Orden y activo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div>
          <label style={estiloLabel}>Orden de aparición</label>
          <input type="number" min="0" style={estiloInput} value={form.orden} onChange={(e) => set('orden', e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
          <input
            type="checkbox"
            id="activo"
            checked={form.activo}
            onChange={(e) => set('activo', e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          <label htmlFor="activo" style={{ fontSize: 14, fontWeight: 600, color: '#2B0A1A', cursor: 'pointer' }}>
            Visible en catálogo
          </label>
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="submit"
          disabled={guardando || subiendo}
          style={{
            padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700,
            background: guardando ? '#F5D5DE' : '#FF6B8A', color: '#fff',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {guardando ? 'Guardando…' : modo === 'nueva' ? 'Crear caja' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/cajas')}
          style={{
            padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: '#fff', color: '#2B0A1A', border: '1.5px solid #F5D5DE',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

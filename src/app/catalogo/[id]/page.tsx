'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { useCarrito } from '@/hooks/useCarrito'
import type { Caja, Variante, VarianteImagen } from '@/types'

type VarianteConImagenes = Variante & { imagenes: VarianteImagen[] }

export default function FichaProductoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { items, agregarItem } = useCarrito()

  const [caja, setCaja] = useState<Caja | null>(null)
  const [variantes, setVariantes] = useState<VarianteConImagenes[]>([])
  const [seleccionada, setSeleccionada] = useState<VarianteConImagenes | null>(null)
  const [fotoActiva, setFotoActiva] = useState<VarianteImagen | null>(null)
  const [cargando, setCargando] = useState(true)
  const [agregado, setAgregado] = useState(false)
  const [errorSeleccion, setErrorSeleccion] = useState('')
  const [esCurso, setEsCurso] = useState(false)
  const [cantidadCurso, setCantidadCurso] = useState(10)
  const [cantidadesCurso, setCantidadesCurso] = useState<Record<string, number>>({})

  const cantidadCarrito = items.reduce((acc, i) => acc + i.cantidad, 0)

  useEffect(() => {
    if (!id) return
    fetch(`/api/catalogo/${id}`)
      .then((r) => r.json())
      .then(({ caja: c, variantes: vs }) => {
        if (!c) { router.replace('/catalogo'); return }
        setCaja(c)
        setVariantes(vs ?? [])
      })
      .finally(() => setCargando(false))
  }, [id, router])

  function seleccionar(v: VarianteConImagenes) {
    setSeleccionada(v)
    setErrorSeleccion('')
    const principal = v.imagenes?.find((i) => i.es_principal) ?? v.imagenes?.[0] ?? null
    setFotoActiva(principal)
  }

  function handleAgregar() {
    if (!caja) return

    if (caja.tipo === 'variantes') {
      if (esCurso && caja.precio_mayorista) {
        const totalUnidades = Object.values(cantidadesCurso).reduce((a, b) => a + b, 0)
        if (totalUnidades < 10) { setErrorSeleccion('El mínimo para pedido de curso es 10 unidades en total.'); return }
        const variantesConQty = variantesPublicadas.filter((v) => (cantidadesCurso[v.id] ?? 0) > 0)
        if (variantesConQty.length === 0) { setErrorSeleccion('Elige al menos una presentación con cantidad mayor a 0.'); return }
        variantesConQty.forEach((v) => {
          agregarItem(caja, v, { cantidad: cantidadesCurso[v.id], precioOverride: caja.precio_mayorista })
        })
      } else {
        if (!seleccionada) { setErrorSeleccion('Selecciona una presentación para continuar.'); return }
        if (seleccionada.estado !== 'publicada') { setErrorSeleccion('Esta presentación no está disponible.'); return }
        if (seleccionada.stock !== undefined && seleccionada.stock <= 0) { setErrorSeleccion('Esta presentación está agotada.'); return }
        if (!seleccionada.precio) { setErrorSeleccion('Esta presentación aún no tiene precio definido.'); return }
        agregarItem(caja, seleccionada)
      }
    } else {
      agregarItem(caja)
    }

    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  if (cargando) {
    return (
      <>
        <Nav cantidadCarrito={cantidadCarrito} />
        <main className="min-h-screen pt-24 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'var(--border)' }} />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />)}
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!caja) return null

  const variantesPublicadas = variantes.filter((v) => v.estado === 'publicada')
  const precio = seleccionada?.precio
  const esAgotada = seleccionada ? seleccionada.stock <= 0 : false
  const totalUnidadesCurso = Object.values(cantidadesCurso).reduce((a, b) => a + b, 0)

  return (
    <>
      <Nav cantidadCarrito={cantidadCarrito} />
      <main className="min-h-screen pt-24 pb-20 px-4" style={{ background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <nav className="mb-8 text-sm" style={{ color: 'var(--muted)' }}>
            <a href="/catalogo" style={{ color: 'var(--muted)' }}>Catálogo</a>
            <span className="mx-2">›</span>
            <span>{caja.nombre}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Galería */}
            <div className="md:sticky top-24">
              {/* Foto principal */}
              <div
                className="rounded-2xl overflow-hidden mb-3"
                style={{
                  background: 'linear-gradient(145deg, #F2F2F2, #E8E8E8)',
                  aspectRatio: '4/5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {fotoActiva ? (
                  <img
                    src={fotoActiva.url}
                    alt={seleccionada?.nombre ?? caja.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : caja.imagen_url ? (
                  <img
                    src={caja.imagen_url}
                    alt={caja.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: 80 }}>{caja.emoji}</span>
                )}
              </div>

              {/* Miniaturas de la variante seleccionada */}
              {seleccionada && (seleccionada.imagenes?.length ?? 0) > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {seleccionada.imagenes!.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setFotoActiva(img)}
                      style={{
                        flexShrink: 0,
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: fotoActiva?.id === img.id ? '2.5px solid var(--dark-bg)' : '2px solid var(--border)',
                        background: '#F2F2F2',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalle */}
            <div>
              <p className="text-xs font-700 uppercase tracking-wider mb-2" style={{ color: 'var(--orange)' }}>
                {caja.categoria}
              </p>
              <h1 className="font-800 mb-3" style={{ fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--fg)', letterSpacing: '-0.02em' }}>
                {caja.nombre}
              </h1>

              <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>
                {seleccionada?.descripcion ?? caja.descripcion_corta ?? caja.descripcion}
              </p>

              {/* Selector de variantes */}
              {caja.tipo === 'variantes' && (
                <div className="mb-6">
                  <p className="text-sm font-700 mb-3" style={{ color: 'var(--fg)' }}>
                    {esCurso && caja.precio_mayorista ? 'Elige la cantidad por presentación' : 'Elige tu presentación'}
                    {!esCurso && seleccionada && <span className="font-400 ml-2" style={{ color: 'var(--muted)' }}>— {seleccionada.nombre}</span>}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {variantesPublicadas.map((v) => {
                      const imgPrincipal = v.imagenes?.find((i) => i.es_principal) ?? v.imagenes?.[0]
                      const agotada = v.stock <= 0
                      const activa = seleccionada?.id === v.id
                      const qtyCurso = cantidadesCurso[v.id] ?? 0

                      if (esCurso && caja.precio_mayorista) {
                        return (
                          <div
                            key={v.id}
                            style={{
                              border: qtyCurso > 0 ? '2.5px solid var(--dark-bg)' : '1.5px solid var(--border)',
                              borderRadius: 12,
                              overflow: 'hidden',
                              background: agotada ? '#F8F8F8' : '#fff',
                              opacity: agotada ? 0.5 : 1,
                              textAlign: 'left',
                            }}
                          >
                            {/* Foto */}
                            <div style={{ aspectRatio: '1/1', background: '#F2F2F2', overflow: 'hidden' }}>
                              {imgPrincipal ? (
                                <img src={imgPrincipal.url} alt={v.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{caja.emoji}</div>
                              )}
                            </div>
                            {/* Nombre + control cantidad */}
                            <div style={{ padding: '8px 10px' }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.3, marginBottom: 6 }}>{v.nombre}</p>
                              {agotada ? (
                                <p style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>Agotado</p>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => setCantidadesCurso((prev) => ({ ...prev, [v.id]: Math.max(0, (prev[v.id] ?? 0) - 1) }))}
                                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)', flexShrink: 0 }}
                                  >−</button>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', minWidth: 22, textAlign: 'center' }}>{qtyCurso}</span>
                                  <button
                                    type="button"
                                    onClick={() => setCantidadesCurso((prev) => ({ ...prev, [v.id]: (prev[v.id] ?? 0) + 1 }))}
                                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)', flexShrink: 0 }}
                                  >+</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <button
                          key={v.id}
                          onClick={() => !agotada && seleccionar(v)}
                          disabled={agotada}
                          style={{
                            border: activa ? '2.5px solid var(--dark-bg)' : '1.5px solid var(--border)',
                            borderRadius: 12,
                            overflow: 'hidden',
                            background: agotada ? '#F8F8F8' : '#fff',
                            cursor: agotada ? 'not-allowed' : 'pointer',
                            opacity: agotada ? 0.5 : 1,
                            textAlign: 'left',
                            padding: 0,
                            transition: 'border-color .15s',
                          }}
                        >
                          {/* Foto */}
                          <div style={{ aspectRatio: '1/1', background: '#F2F2F2', overflow: 'hidden' }}>
                            {imgPrincipal ? (
                              <img src={imgPrincipal.url} alt={v.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{caja.emoji}</div>
                            )}
                          </div>
                          {/* Nombre + precio */}
                          <div style={{ padding: '8px 10px' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.3, marginBottom: 2 }}>{v.nombre}</p>
                            {v.precio ? (
                              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--dark-bg)' }}>${v.precio.toLocaleString('es-CL')}</p>
                            ) : (
                              <p style={{ fontSize: 11, color: 'var(--muted)' }}>Precio pendiente</p>
                            )}
                            {agotada && <p style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>Agotado</p>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Opción curso */}
              {caja.tipo === 'variantes' && caja.precio_mayorista && (
                <div className="mb-5 p-4 rounded-2xl" style={{ background: '#FFF8F0', border: '1.5px solid #FFE0B2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={esCurso}
                      onChange={(e) => { setEsCurso(e.target.checked); setErrorSeleccion(''); setCantidadesCurso({}) }}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--dark-bg)' }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>
                      Es para un curso completo — ${caja.precio_mayorista.toLocaleString('es-CL')} c/u
                    </span>
                  </label>
                  {esCurso && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff', borderRadius: 10, border: '1px solid #FFE0B2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                          Total unidades: <strong style={{ color: totalUnidadesCurso >= 10 ? 'var(--fg)' : '#DC2626' }}>{totalUnidadesCurso}</strong>
                          {totalUnidadesCurso < 10 && <span style={{ fontSize: 11, color: '#DC2626', marginLeft: 6 }}>(mín. 10)</span>}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg)' }}>
                          ${(totalUnidadesCurso * caja.precio_mayorista).toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Precio */}
              {!esCurso && precio && (
                <div className="mb-6">
                  <span className="font-900" style={{ fontSize: 32, color: 'var(--fg)' }}>
                    ${precio.toLocaleString('es-CL')}
                  </span>
                </div>
              )}

              {/* Error selección */}
              {errorSeleccion && (
                <p className="mb-4 text-sm" style={{ color: '#DC2626' }}>{errorSeleccion}</p>
              )}

              {/* Botón agregar */}
              <button
                onClick={handleAgregar}
                disabled={esAgotada || agregado}
                className="w-full py-4 rounded-full font-800 text-base transition-all"
                style={{
                  background: agregado ? '#16a34a' : esAgotada ? '#ccc' : 'var(--dark-bg)',
                  color: '#fff',
                  cursor: esAgotada ? 'not-allowed' : 'pointer',
                }}
              >
                {agregado
                  ? '✓ Agregado al carrito'
                  : esAgotada
                  ? 'Agotado'
                  : esCurso && caja.precio_mayorista
                  ? totalUnidadesCurso > 0
                    ? `Agregar ${totalUnidadesCurso} unidades al carrito →`
                    : 'Elige las cantidades por presentación'
                  : caja.tipo === 'variantes' && !seleccionada
                  ? 'Selecciona una presentación'
                  : 'Agregar al carrito →'
                }
              </button>

              {/* Descripción completa */}
              {caja.tipo === 'variantes' && caja.descripcion && (
                <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                  <h2 className="font-700 mb-3 text-base" style={{ color: 'var(--fg)' }}>Acerca de este producto</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{caja.descripcion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

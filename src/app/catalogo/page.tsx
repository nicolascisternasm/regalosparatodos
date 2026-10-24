'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Caja } from '@/types'
import { useCarrito } from '@/hooks/useCarrito'
import Nav from '@/components/Nav'

export default function CatalogoPage() {
  const [cajas, setCajas] = useState<Caja[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const { agregarItem, items } = useCarrito()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('cat')
    if (cat) setCategoriaActiva(cat)
  }, [])

  useEffect(() => {
    fetch('/api/catalogo')
      .then((r) => r.json())
      .then(({ cajas }) => setCajas(cajas ?? []))
      .finally(() => setCargando(false))
  }, [])

  const categorias = ['Todas', ...new Set(cajas.map((c) => c.categoria))]
  const cajasFiltradas = categoriaActiva === 'Todas'
    ? cajas
    : cajas.filter((c) => c.categoria === categoriaActiva)

  const cantidadCarrito = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <>
      <Nav cantidadCarrito={cantidadCarrito} />
      <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Header del catálogo */}
        <div
          className="pt-24 pb-10 px-4 md:px-6"
          style={{ background: 'var(--dark-bg)' }}
        >
          <div className="max-w-6xl mx-auto">
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Catálogo
            </p>
            <h1
              style={{ fontSize: 'clamp(26px, 5vw, 52px)', fontWeight: 700, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}
            >
              Elige tu caja perfecta
            </h1>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 'clamp(13px, 2vw, 16px)' }}>
              Todas las cajas se arman y despachan desde Talagante vía Starken.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">

          {/* Filtros + controles */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex gap-2 flex-wrap">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className="px-4 py-2 text-sm transition-all"
                  style={{
                    background: categoriaActiva === cat ? 'var(--dark-bg)' : '#fff',
                    color: categoriaActiva === cat ? '#fff' : 'var(--fg)',
                    border: `1.5px solid ${categoriaActiva === cat ? 'var(--dark-bg)' : 'var(--border)'}`,
                    borderRadius: 100,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {!cargando && (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {cajasFiltradas.length} {cajasFiltradas.length === 1 ? 'resultado' : 'resultados'}
                </p>
              )}
              <select
                style={{
                  padding: '8px 14px',
                  fontSize: 13,
                  border: '1.5px solid var(--border)',
                  borderRadius: 100,
                  background: '#fff',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                <option value="relevancia">Ordenar: Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A–Z</option>
              </select>
            </div>
          </div>

          {cargando ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: 'var(--border)' }} />
              ))}
            </div>
          ) : cajasFiltradas.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📦</p>
              <p className="font-700 text-lg mb-2" style={{ color: 'var(--fg)' }}>Sin cajas en esta categoría</p>
              <button
                onClick={() => setCategoriaActiva('Todas')}
                className="mt-4 px-6 py-3 rounded-full text-sm font-800"
                style={{ background: 'var(--dark-bg)', color: '#fff' }}
              >
                Ver todas las cajas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {cajasFiltradas.map((caja) => (
                <CajaCard key={caja.id} caja={caja} onAgregar={() => agregarItem(caja)} />
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  )
}

function CajaCard({ caja, onAgregar }: { caja: Caja; onAgregar: () => void }) {
  const [agregado, setAgregado] = useState(false)

  const descuento = caja.precio_original
    ? Math.round((1 - caja.precio / caja.precio_original) * 100)
    : null

  function handleAgregar() {
    onAgregar()
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1800)
  }

  return (
    <article
      className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 hover:-translate-y-1.5"
      style={{
        background: '#fff',
        border: '1.5px solid var(--border)',
        boxShadow: '0 2px 10px rgba(43,10,26,.04)',
      }}
    >
      {/* Imagen */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #F2F2F2 0%, #E8E8E8 100%)' }}
      >
        {/* Badge descuento */}
        {descuento && (
          <span
            className="absolute top-3 left-3 text-xs font-800 px-2.5 py-1 rounded-full z-10"
            style={{ background: 'var(--dark-bg)', color: '#fff' }}
          >
            -{descuento}%
          </span>
        )}

        {caja.imagen_url ? (
          <img
            src={caja.imagen_url}
            alt={caja.nombre}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span
            className="text-8xl transition-transform duration-300 group-hover:scale-110 inline-block"
            role="img"
            aria-label={caja.nombre}
          >
            {caja.emoji}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: 'var(--orange)' }}>
          {caja.categoria}
        </p>
        <h3 className="font-800 text-base mb-1 leading-snug" style={{ color: 'var(--fg)' }}>
          {caja.nombre}
        </h3>
        <p className="text-xs flex-1 mb-4 leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
          {caja.descripcion}
        </p>

        {/* Precio por curso (si tiene precio_mayorista) */}
        {caja.precio_mayorista && (
          <div
            className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #FFF8E8 0%, #FFF0D0 100%)', border: '1px solid #F5D87A' }}
          >
            <span className="text-base">🎓</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-800 leading-none" style={{ color: '#A06000' }}>
                Precio por curso
              </p>
              <p className="text-xs leading-tight mt-0.5" style={{ color: '#C08020' }}>
                ${caja.precio_mayorista.toLocaleString('es-CL')} · ¡Aprovecha esta oferta!
              </p>
            </div>
          </div>
        )}

        {/* Precio + botón */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-900 text-lg leading-none" style={{ color: 'var(--fg)' }}>
              ${caja.precio.toLocaleString('es-CL')}
            </span>
            {caja.precio_original && (
              <span className="text-xs line-through mt-0.5" style={{ color: 'var(--muted2)' }}>
                ${caja.precio_original.toLocaleString('es-CL')}
              </span>
            )}
          </div>
          {caja.tipo === 'variantes' ? (
            <Link
              href={`/catalogo/${caja.id}`}
              className="px-4 py-2 rounded-full text-xs font-800 transition-all flex-shrink-0 no-underline"
              style={{ background: 'var(--dark-bg)', color: '#fff' }}
            >
              Ver variantes →
            </Link>
          ) : (
            <button
              onClick={handleAgregar}
              className="px-4 py-2 rounded-full text-xs font-800 transition-all flex-shrink-0"
              style={{
                background: agregado ? '#16a34a' : 'var(--dark-bg)',
                color: '#fff',
              }}
            >
              {agregado ? '✓ Agregado' : 'Agregar'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

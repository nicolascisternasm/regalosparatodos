'use client'

import { useEffect, useState } from 'react'
import type { Caja } from '@/types'
import { useCarrito } from '@/hooks/useCarrito'
import Nav from '@/components/Nav'

export default function CatalogoPage() {
  const [cajas, setCajas] = useState<Caja[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const { agregarItem, items } = useCarrito()

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

        {/* Header del catálogo — fondo oscuro como la referencia */}
        <div
          className="pt-24 pb-14 px-6"
          style={{ background: 'var(--dark-bg)' }}
        >
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
              Catálogo
            </p>
            <h1
              className="text-4xl md:text-5xl font-900 mb-3"
              style={{ color: '#fff', letterSpacing: '-0.03em' }}
            >
              Elige tu caja perfecta
            </h1>
            <p style={{ color: 'rgba(255,255,255,.5)' }}>
              Todas las cajas se arman y despachan desde Talagante vía Starken.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Filtros tipo tabs */}
          <div className="flex gap-2 flex-wrap mb-3">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className="px-5 py-2 rounded-full text-sm font-700 transition-all"
                style={{
                  background: categoriaActiva === cat ? 'var(--dark-bg)' : '#fff',
                  color: categoriaActiva === cat ? '#fff' : 'var(--fg)',
                  border: `1.5px solid ${categoriaActiva === cat ? 'var(--dark-bg)' : 'var(--border)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Contador */}
          {!cargando && (
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              {cajasFiltradas.length} {cajasFiltradas.length === 1 ? 'caja disponible' : 'cajas disponibles'}
            </p>
          )}

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
        style={{ background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE0EC 50%, #FFF8F0 100%)' }}
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

        <span
          className="text-8xl transition-transform duration-300 group-hover:scale-110 inline-block"
          role="img"
          aria-label={caja.nombre}
        >
          {caja.emoji}
        </span>
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
        </div>
      </div>
    </article>
  )
}

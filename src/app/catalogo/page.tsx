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
      <main className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
        <section className="max-w-6xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--red)' }}>
              Catálogo
            </p>
            <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--fg)' }}>
              Elige tu caja perfecta
            </h1>
            <p style={{ color: 'var(--muted)' }}>
              Todas las cajas se arman y despachan desde Talagante vía Starken.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap mb-8">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className="px-4 py-2 rounded-full text-sm font-600 transition-all"
                style={{
                  background: categoriaActiva === cat ? 'var(--gold)' : '#fff',
                  color: categoriaActiva === cat ? '#fff' : 'var(--fg)',
                  border: `1.5px solid ${categoriaActiva === cat ? 'var(--gold)' : 'var(--border)'}`,
                  boxShadow: categoriaActiva === cat ? '0 4px 12px rgba(255,107,138,.3)' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Contador */}
          {!cargando && (
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              {cajasFiltradas.length} {cajasFiltradas.length === 1 ? 'caja disponible' : 'cajas disponibles'}
            </p>
          )}

          {cargando ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: 'var(--border)' }} />
              ))}
            </div>
          ) : cajasFiltradas.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📦</p>
              <p className="font-700" style={{ color: 'var(--fg)' }}>No hay cajas en esta categoría</p>
              <button
                onClick={() => setCategoriaActiva('Todas')}
                className="mt-4 px-5 py-2 rounded-full text-sm font-700"
                style={{ background: 'var(--gold)', color: '#fff' }}
              >
                Ver todas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {cajasFiltradas.map((caja) => (
                <CajaCard key={caja.id} caja={caja} onAgregar={() => agregarItem(caja)} />
              ))}
            </div>
          )}
        </section>
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
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1.5 group"
      style={{
        background: '#fff',
        border: '1.5px solid var(--border)',
        boxShadow: '0 2px 12px rgba(43,10,26,.04)',
      }}
    >
      {/* Imagen / emoji */}
      <div
        className="h-48 flex items-center justify-center text-7xl relative"
        style={{ background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE0EC 60%, #FFF5E8 100%)' }}
      >
        {descuento && (
          <span
            className="absolute top-3 left-3 text-xs font-800 px-2.5 py-1 rounded-full"
            style={{ background: '#FF6B8A', color: '#fff' }}
          >
            -{descuento}%
          </span>
        )}
        <span className="transition-transform duration-300 group-hover:scale-110 inline-block">
          {caja.emoji}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-700 uppercase tracking-wider mb-1.5" style={{ color: 'var(--red)' }}>
          {caja.categoria}
        </p>
        <h3 className="font-800 text-lg mb-1.5 leading-tight" style={{ color: 'var(--fg)' }}>
          {caja.nombre}
        </h3>
        <p className="text-sm flex-1 mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
          {caja.descripcion}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-900 text-xl" style={{ color: 'var(--fg)' }}>
              ${caja.precio.toLocaleString('es-CL')}
            </span>
            {caja.precio_original && (
              <span className="text-sm line-through" style={{ color: 'var(--muted)' }}>
                ${caja.precio_original.toLocaleString('es-CL')}
              </span>
            )}
          </div>
          <button
            onClick={handleAgregar}
            className="px-4 py-2 rounded-full text-sm font-800 transition-all flex-shrink-0"
            style={{
              background: agregado ? '#22c55e' : 'var(--gold)',
              color: '#fff',
              boxShadow: agregado ? '0 4px 12px rgba(34,197,94,.3)' : '0 4px 12px rgba(255,107,138,.3)',
              transform: agregado ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {agregado ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

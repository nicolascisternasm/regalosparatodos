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
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--red)' }}>
              Catálogo
            </p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--fg)' }}>
              Elige tu caja perfecta
            </h1>
            <p className="mt-2" style={{ color: 'var(--muted)' }}>
              Todas las cajas se arman y despachan desde Talagante.
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
                  background: categoriaActiva === cat ? 'var(--gold)' : 'var(--card)',
                  color: categoriaActiva === cat ? '#fff' : 'var(--fg)',
                  border: `1.5px solid ${categoriaActiva === cat ? 'var(--gold)' : 'var(--border)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {cargando ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: 'var(--border)' }} />
              ))}
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

  function handleAgregar() {
    onAgregar()
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1500)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
      style={{
        background: 'var(--card)',
        border: '1.5px solid var(--border)',
        boxShadow: '0 4px 20px rgba(255,107,138,.07)',
      }}
    >
      <div
        className="h-40 flex items-center justify-center text-6xl"
        style={{ background: 'linear-gradient(135deg, #FFE8F0 0%, #FFD5E5 100%)' }}
      >
        {caja.emoji}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-600 uppercase tracking-wider mb-1" style={{ color: 'var(--red)' }}>
          {caja.categoria}
        </p>
        <h3 className="font-800 text-lg mb-1" style={{ color: 'var(--fg)' }}>{caja.nombre}</h3>
        <p className="text-sm flex-1 mb-4" style={{ color: 'var(--muted)' }}>{caja.descripcion}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-900 text-lg" style={{ color: 'var(--fg)' }}>
              ${caja.precio.toLocaleString('es-CL')}
            </span>
            {caja.precio_original && (
              <span className="text-xs line-through ml-2" style={{ color: 'var(--muted)' }}>
                ${caja.precio_original.toLocaleString('es-CL')}
              </span>
            )}
          </div>
          <button
            onClick={handleAgregar}
            className="px-4 py-2 rounded-full text-sm font-700 transition-all"
            style={{
              background: agregado ? '#22c55e' : 'var(--gold)',
              color: '#fff',
            }}
          >
            {agregado ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

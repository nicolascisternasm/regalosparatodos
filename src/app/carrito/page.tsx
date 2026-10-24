'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrito } from '@/hooks/useCarrito'
import Nav from '@/components/Nav'
import { calcularFechaDespacho } from '@/lib/despacho'
import type { DatosComprador, DatosDestinatario, DatosDespacho } from '@/types'

const COSTO_DESPACHO = 4990

export default function CarritoPage() {
  const { items, reducirItem, agregarItem, eliminarItem, subtotal, vaciarCarrito } = useCarrito()
  const router = useRouter()
  const [paso, setPaso] = useState<'carrito' | 'datos'>('carrito')
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState('')

  const [comprador, setComprador] = useState<DatosComprador>({ nombre: '', email: '', telefono: '' })
  const [destinatario, setDestinatario] = useState<DatosDestinatario>({ nombre: '', telefono: '', mensaje_tarjeta: '' })
  const [despacho, setDespacho] = useState<DatosDespacho>({ tipo: 'domicilio', region: '', ciudad: '', direccion: '', numero: '' })

  const total = subtotal + COSTO_DESPACHO
  const fechaInfo = calcularFechaDespacho()
  const cantidadCarrito = items.reduce((acc, i) => acc + i.cantidad, 0)

  async function confirmarPedido() {
    setError('')
    setConfirmando(true)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, comprador, destinatario, despacho }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear pedido')

      const pedido = data.pedido
      vaciarCarrito()
      router.push(`/pedido/${pedido.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
      setConfirmando(false)
    }
  }

  if (items.length === 0 && paso === 'carrito') {
    return (
      <>
        <Nav cantidadCarrito={0} />
        <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-800 mb-2" style={{ color: 'var(--fg)' }}>Tu carrito está vacío</h2>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>Agrega algunas cajas para continuar.</p>
          <a href="/catalogo" className="px-6 py-3 rounded-full font-700" style={{ background: 'var(--gold)', color: '#fff' }}>
            Ver catálogo
          </a>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav cantidadCarrito={cantidadCarrito} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: 'var(--bg)' }}>
        <div className="max-w-3xl mx-auto">
          {/* Pasos */}
          <div className="flex items-center gap-2 mb-8 mt-4">
            {['carrito', 'datos'].map((p, i) => (
              <div key={p} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-800"
                  style={{
                    background: paso === p || (p === 'carrito' && paso === 'datos') ? 'var(--gold)' : 'var(--border)',
                    color: paso === p || (p === 'carrito' && paso === 'datos') ? '#fff' : 'var(--muted)',
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-sm font-600 capitalize" style={{ color: 'var(--fg)' }}>
                  {p === 'carrito' ? 'Carrito' : 'Tus datos'}
                </span>
                {i < 1 && <span style={{ color: 'var(--border)' }}>→</span>}
              </div>
            ))}
          </div>

          {paso === 'carrito' && (
            <div className="space-y-4">
              {items.map((item) => {
                const precio = item.precio_unitario_override ?? item.variante?.precio ?? item.caja.precio
                const varId = item.variante?.id
                return (
                  <div key={`${item.caja.id}:${varId ?? ''}`} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
                    <div className="text-3xl">{item.caja.emoji}</div>
                    <div className="flex-1">
                      <p className="font-700" style={{ color: 'var(--fg)' }}>{item.caja.nombre}</p>
                      {item.variante && (
                        <p className="text-xs font-600" style={{ color: 'var(--orange)' }}>{item.variante.nombre}{item.variante.sku ? ` · ${item.variante.sku}` : ''}</p>
                      )}
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>${precio.toLocaleString('es-CL')} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => reducirItem(item.caja.id, varId)} className="w-8 h-8 rounded-full font-700 flex items-center justify-center" style={{ border: '1.5px solid var(--border)' }}>-</button>
                      <span className="font-700 w-6 text-center" style={{ color: 'var(--fg)' }}>{item.cantidad}</span>
                      <button onClick={() => agregarItem(item.caja, item.variante)} className="w-8 h-8 rounded-full font-700 flex items-center justify-center" style={{ border: '1.5px solid var(--border)' }}>+</button>
                    </div>
                    <p className="font-800 w-20 text-right" style={{ color: 'var(--fg)' }}>${(precio * item.cantidad).toLocaleString('es-CL')}</p>
                    <button onClick={() => eliminarItem(item.caja.id, varId)} className="text-sm" style={{ color: 'var(--muted)' }}>✕</button>
                  </div>
                )
              })}

              {/* Resumen */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
                <div className="flex justify-between mb-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <span>Subtotal</span><span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                  <span>Despacho Starken</span><span>${COSTO_DESPACHO.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between font-800 text-lg border-t pt-3" style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}>
                  <span>Total</span><span>${total.toLocaleString('es-CL')}</span>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                  📅 {fechaInfo.mensajeEstimado}
                </p>
              </div>

              <button onClick={() => setPaso('datos')} className="w-full py-4 rounded-full font-800 text-base" style={{ background: 'var(--gold)', color: '#fff' }}>
                Continuar →
              </button>
            </div>
          )}

          {paso === 'datos' && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl text-sm" style={{ background: '#FFF0F0', border: '1px solid #FFCCCC', color: '#CC0000' }}>
                  {error}
                </div>
              )}

              {/* Datos comprador */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
                <h3 className="font-800 mb-4" style={{ color: 'var(--fg)' }}>Tus datos</h3>
                <div className="space-y-3">
                  <Input label="Nombre completo" value={comprador.nombre} onChange={(v) => setComprador({ ...comprador, nombre: v })} />
                  <Input label="Email" type="email" value={comprador.email} onChange={(v) => setComprador({ ...comprador, email: v })} />
                  <Input label="Teléfono" type="tel" value={comprador.telefono} onChange={(v) => setComprador({ ...comprador, telefono: v })} placeholder="+56 9 xxxx xxxx" />
                </div>
              </div>

              {/* Datos destinatario */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
                <h3 className="font-800 mb-4" style={{ color: 'var(--fg)' }}>¿A quién va dirigido?</h3>
                <div className="space-y-3">
                  <Input label="Nombre del destinatario" value={destinatario.nombre} onChange={(v) => setDestinatario({ ...destinatario, nombre: v })} />
                  <Input label="Teléfono del destinatario" type="tel" value={destinatario.telefono} onChange={(v) => setDestinatario({ ...destinatario, telefono: v })} placeholder="+56 9 xxxx xxxx" />
                  <div>
                    <label className="block text-sm font-600 mb-1" style={{ color: 'var(--muted)' }}>Mensaje para la tarjeta (opcional)</label>
                    <textarea
                      value={destinatario.mensaje_tarjeta}
                      onChange={(e) => setDestinatario({ ...destinatario, mensaje_tarjeta: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                      style={{ border: '1.5px solid var(--border)', color: 'var(--fg)', background: 'var(--bg)' }}
                      placeholder="Ej: Feliz cumpleaños, te quiero mucho!"
                    />
                  </div>
                </div>
              </div>

              {/* Despacho */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}>
                <h3 className="font-800 mb-4" style={{ color: 'var(--fg)' }}>Despacho</h3>
                <div className="flex gap-3 mb-4">
                  {(['domicilio', 'sucursal'] as const).map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setDespacho({ ...despacho, tipo })}
                      className="flex-1 py-2 rounded-full text-sm font-700 transition-all capitalize"
                      style={{
                        background: despacho.tipo === tipo ? 'var(--gold)' : 'var(--bg)',
                        color: despacho.tipo === tipo ? '#fff' : 'var(--fg)',
                        border: `1.5px solid ${despacho.tipo === tipo ? 'var(--gold)' : 'var(--border)'}`,
                      }}
                    >
                      {tipo === 'domicilio' ? '🏠 Domicilio' : '📦 Sucursal Starken'}
                    </button>
                  ))}
                </div>
                {despacho.tipo === 'domicilio' ? (
                  <div className="space-y-3">
                    <Input label="Región" value={despacho.region ?? ''} onChange={(v) => setDespacho({ ...despacho, region: v })} />
                    <Input label="Ciudad / Comuna" value={despacho.ciudad ?? ''} onChange={(v) => setDespacho({ ...despacho, ciudad: v })} />
                    <Input label="Dirección" value={despacho.direccion ?? ''} onChange={(v) => setDespacho({ ...despacho, direccion: v })} />
                    <div className="flex gap-3">
                      <Input label="Número" value={despacho.numero ?? ''} onChange={(v) => setDespacho({ ...despacho, numero: v })} />
                      <Input label="Depto / Casa (opc.)" value={despacho.depto ?? ''} onChange={(v) => setDespacho({ ...despacho, depto: v })} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input label="Ciudad de la sucursal" value={despacho.ciudad_sucursal ?? ''} onChange={(v) => setDespacho({ ...despacho, ciudad_sucursal: v })} />
                    <Input label="Nombre o código de sucursal" value={despacho.nombre_sucursal ?? ''} onChange={(v) => setDespacho({ ...despacho, nombre_sucursal: v })} />
                  </div>
                )}
                <p className="text-xs mt-3 p-3 rounded-lg" style={{ background: '#FFF0F3', color: 'var(--muted)' }}>
                  📅 <strong>{fechaInfo.mensajeEstimado}</strong> · Despachos martes y jueves desde Talagante.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPaso('carrito')} className="flex-1 py-4 rounded-full font-700" style={{ border: '1.5px solid var(--border)', color: 'var(--fg)', background: 'var(--card)' }}>
                  ← Volver
                </button>
                <button onClick={confirmarPedido} disabled={confirmando} className="flex-1 py-4 rounded-full font-800" style={{ background: 'var(--gold)', color: '#fff', opacity: confirmando ? 0.7 : 1 }}>
                  {confirmando ? 'Procesando…' : 'Confirmar pedido →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-600 mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{ border: '1.5px solid var(--border)', color: 'var(--fg)', background: 'var(--bg)' }}
      />
    </div>
  )
}

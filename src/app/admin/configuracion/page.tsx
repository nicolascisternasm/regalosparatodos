'use client'

import { useContext, useEffect, useState } from 'react'
import { AdminTokenContext } from '../AdminAuthContext'

interface Config {
  supervisor_nombre: string
  supervisor_whatsapp: string
  vendedora_nombre: string
  vendedora_whatsapp: string
  vendedora_descripcion: string
}

const DEFAULT_CONFIG: Config = {
  supervisor_nombre: '',
  supervisor_whatsapp: '',
  vendedora_nombre: '',
  vendedora_whatsapp: '',
  vendedora_descripcion: '',
}

export default function ConfiguracionPage() {
  const token = useContext(AdminTokenContext)
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/configuracion', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(({ config }) => {
        if (config) setConfig({ ...DEFAULT_CONFIG, ...config })
      })
      .finally(() => setCargando(false))
  }, [token])

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')
    const res = await fetch('/api/admin/configuracion', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(config),
    })
    setGuardando(false)
    if (res.ok) {
      setMensaje('✅ Configuración guardada')
      setTimeout(() => setMensaje(''), 3000)
    } else {
      setMensaje('❌ Error al guardar')
    }
  }

  if (cargando) return <div style={{ color: '#A06070', fontSize: 14 }}>Cargando…</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-900 mb-1" style={{ color: '#2B0A1A' }}>⚙️ Configuración del sistema</h1>
      <p className="text-sm mb-8" style={{ color: '#A06070' }}>Ajustes generales del negocio. Los cambios se aplican de inmediato.</p>

      <form onSubmit={guardar} className="space-y-6">

        {/* Supervisor */}
        <section className="rounded-2xl p-6" style={{ background: '#fff', border: '1.5px solid #F0D0DB' }}>
          <h2 className="font-800 mb-1" style={{ color: '#2B0A1A' }}>👤 Supervisor de ventas</h2>
          <p className="text-xs mb-4" style={{ color: '#A06070' }}>
            Este número recibe el WhatsApp automático cada vez que un cliente adjunta un comprobante de pago.
          </p>
          <div className="space-y-3">
            <Field
              label="Nombre del supervisor"
              value={config.supervisor_nombre}
              onChange={(v) => setConfig({ ...config, supervisor_nombre: v })}
              placeholder="Ej: Nicolás"
            />
            <Field
              label="WhatsApp del supervisor"
              value={config.supervisor_whatsapp}
              onChange={(v) => setConfig({ ...config, supervisor_whatsapp: v.replace(/\D/g, '') })}
              placeholder="56912345678"
              hint="Incluye código de país sin + (ej: 56912345678)"
            />
          </div>

          {config.supervisor_whatsapp && (
            <a
              href={`https://wa.me/${config.supervisor_whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-600 underline"
              style={{ color: '#25D366' }}
            >
              ✓ Verificar número en WhatsApp ↗
            </a>
          )}
        </section>

        {/* Vendedora virtual — próximamente */}
        <section className="rounded-2xl p-6" style={{ background: '#fff', border: '1.5px solid #F0D0DB', opacity: 0.7 }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-800" style={{ color: '#2B0A1A' }}>🤖 Asistente virtual de ventas</h2>
            <span className="text-xs font-700 px-2 py-0.5 rounded-full" style={{ background: '#FFF0E8', color: '#C05000' }}>Próximamente</span>
          </div>
          <p className="text-xs mb-4" style={{ color: '#A06070' }}>
            La vendedora virtual responderá consultas por WhatsApp con los conocimientos y aptitudes que configures aquí.
          </p>
          <div className="space-y-3">
            <Field
              label="Nombre de la asistente"
              value={config.vendedora_nombre}
              onChange={(v) => setConfig({ ...config, vendedora_nombre: v })}
              placeholder="Ej: Sofía"
              disabled
            />
            <Field
              label="WhatsApp de la asistente"
              value={config.vendedora_whatsapp}
              onChange={(v) => setConfig({ ...config, vendedora_whatsapp: v })}
              placeholder="56912345678"
              disabled
            />
            <div>
              <label className="block text-sm font-600 mb-1" style={{ color: '#A06070' }}>
                Conocimientos y aptitudes
              </label>
              <textarea
                value={config.vendedora_descripcion}
                onChange={(e) => setConfig({ ...config, vendedora_descripcion: e.target.value })}
                rows={4}
                disabled
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ border: '1.5px solid #F0D0DB', color: '#A06070', background: '#FDF5F7', opacity: 0.6 }}
                placeholder="Describe los productos que conoce, el tono de respuesta, políticas de despacho, promociones activas…"
              />
            </div>
          </div>
        </section>

        {/* Guardar */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={guardando}
            className="px-8 py-3 rounded-full font-800 text-sm"
            style={{ background: '#2B0A1A', color: '#fff', opacity: guardando ? 0.6 : 1, cursor: guardando ? 'not-allowed' : 'pointer' }}
          >
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {mensaje && <p className="text-sm font-600">{mensaje}</p>}
        </div>
      </form>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, hint, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; hint?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-600 mb-1" style={{ color: '#A06070' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{
          border: '1.5px solid #F0D0DB',
          color: disabled ? '#A06070' : '#2B0A1A',
          background: disabled ? '#FDF5F7' : '#fff',
          opacity: disabled ? 0.6 : 1,
        }}
      />
      {hint && <p className="text-xs mt-0.5" style={{ color: '#B08090' }}>{hint}</p>}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const [sesionOk, setSesionOk] = useState(false)

  useEffect(() => {
    // Supabase intercepts the recovery token from the URL hash and emits PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSesionOk(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setListo(true)
      setTimeout(() => router.replace('/admin/login'), 2500)
    } catch {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#2B0A1A',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 360,
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <span style={{ fontSize: 36 }}>🔐</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#2B0A1A', marginTop: 10 }}>
            Nueva contraseña
          </h1>
        </div>

        {listo ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#2B0A1A', marginBottom: 8 }}>
              Contraseña actualizada
            </p>
            <p style={{ fontSize: 13, color: '#A06070' }}>
              Redirigiendo al login…
            </p>
          </div>
        ) : !sesionOk ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#A06070', marginBottom: 20 }}>
              Verificando enlace de recuperación…
            </p>
            <p style={{ fontSize: 12, color: '#DC2626' }}>
              Si este mensaje persiste, el enlace puede haber expirado. Solicita uno nuevo desde el login.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2B0A1A', marginBottom: 6 }}>
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1.5px solid #F5D5DE', borderRadius: 8, outline: 'none', color: '#2B0A1A', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2B0A1A', marginBottom: 6 }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1.5px solid #F5D5DE', borderRadius: 8, outline: 'none', color: '#2B0A1A', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16, padding: '8px 12px', background: '#FEF2F2', borderRadius: 6 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, background: loading ? '#F5D5DE' : '#FF6B8A', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

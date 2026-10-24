'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<'login' | 'recuperar'>('login')
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError('Credenciales incorrectas')
        return
      }

      if (data.user?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut()
        setError('Esta cuenta no tiene acceso de administrador')
        return
      }

      router.replace('/admin')
    } catch {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })
      if (resetError) throw resetError
      setEnviado(true)
    } catch {
      setError('No se pudo enviar el correo. Verifica el email.')
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
          <span style={{ fontSize: 36 }}>🎁</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#2B0A1A', marginTop: 10 }}>
            {modo === 'recuperar' ? 'Recuperar contraseña' : 'Panel Administrativo'}
          </h1>
          <p style={{ fontSize: 13, color: '#A06070', marginTop: 4 }}>
            {modo === 'recuperar' ? ' ' : 'Ingresa con tu cuenta autorizada'}
          </p>
        </div>

        {modo === 'recuperar' ? (
          enviado ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>📬</p>
              <p style={{ fontSize: 14, color: '#2B0A1A', fontWeight: 600, marginBottom: 8 }}>Revisa tu correo</p>
              <p style={{ fontSize: 13, color: '#A06070', marginBottom: 20 }}>
                Te enviamos un enlace para crear una nueva contraseña. Válido por 1 hora.
              </p>
              <button
                onClick={() => { setModo('login'); setEnviado(false) }}
                style={{ fontSize: 13, color: '#FF6B8A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Volver al login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRecuperar}>
              <p style={{ fontSize: 13, color: '#A06070', marginBottom: 16 }}>
                Ingresa tu email y te enviaremos un enlace para cambiar tu contraseña.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2B0A1A', marginBottom: 6 }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
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
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
              <button
                type="button"
                onClick={() => { setModo('login'); setError('') }}
                style={{ width: '100%', marginTop: 10, fontSize: 13, color: '#A06070', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Volver al login
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2B0A1A', marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1.5px solid #F5D5DE', borderRadius: 8, outline: 'none', color: '#2B0A1A', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2B0A1A', marginBottom: 6 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1.5px solid #F5D5DE', borderRadius: 8, outline: 'none', color: '#2B0A1A', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => { setModo('recuperar'); setError('') }}
                style={{ fontSize: 12, color: '#A06070', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16, padding: '8px 12px', background: '#FEF2F2', borderRadius: 6 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, background: loading ? '#F5D5DE' : '#FF6B8A', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

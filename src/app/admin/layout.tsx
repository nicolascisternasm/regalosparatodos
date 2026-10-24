'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AdminTokenContext } from './AdminAuthContext'

const NAV_ITEMS = [
  { href: '/admin', label: '📊 Inicio', exact: true },
  { href: '/admin/pedidos', label: '📦 Pedidos' },
  { href: '/admin/pagos', label: '💳 Pagos' },
  { href: '/admin/cajas', label: '🎁 Cajas' },
  { href: '/admin/configuracion', label: '⚙️ Configuración' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/reset-password'

  const [authState, setAuthState] = useState<'checking' | 'ok' | 'redirect'>('checking')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (isLoginPage) {
      setAuthState('ok')
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user.app_metadata?.role === 'admin') {
        setToken(session.access_token)
        setEmail(session.user.email ?? '')
        setAuthState('ok')
      } else {
        router.replace('/admin/login')
        setAuthState('redirect')
      }
    })
  }, [isLoginPage, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (authState === 'checking') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F0F3',
      }}>
        <p style={{ color: '#A06070', fontSize: 14 }}>Verificando acceso…</p>
      </div>
    )
  }

  if (authState === 'redirect') return null

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminTokenContext.Provider value={token}>
      <div className="min-h-screen flex" style={{ background: '#F8F0F3' }}>
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 flex flex-col py-6 px-4" style={{ background: '#2B0A1A', minHeight: '100vh' }}>
          <Link href="/admin" className="block mb-8 no-underline">
            <span className="font-900 text-base" style={{ color: '#fff' }}>
              Regalos<span style={{ color: '#FF6B8A' }}>Para</span>Todos
            </span>
            <span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>Panel Admin</span>
          </Link>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, exact }) => {
              const activo = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2 rounded-xl text-sm font-600 no-underline transition-all"
                  style={{
                    background: activo ? 'rgba(255,107,138,.2)' : 'transparent',
                    color: activo ? '#FF6B8A' : 'rgba(255,255,255,.65)',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-6 flex flex-col gap-3">
            {email && (
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,.3)' }}>{email}</p>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,107,138,.6)', fontFamily: 'inherit' }}
            >
              Cerrar sesión →
            </button>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="text-xs no-underline" style={{ color: 'rgba(255,255,255,.3)' }}>
              ← Ver tienda ↗
            </Link>
          </div>
        </aside>

        {/* Contenido */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </AdminTokenContext.Provider>
  )
}

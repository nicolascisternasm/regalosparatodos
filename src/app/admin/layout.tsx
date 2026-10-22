'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: '📊 Inicio', exact: true },
  { href: '/admin/pedidos', label: '📦 Pedidos' },
  { href: '/admin/pagos', label: '💳 Pagos' },
  { href: '/admin/cajas', label: '🎁 Cajas' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
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

        <div className="mt-auto pt-6">
          <Link href="/" className="text-xs no-underline" style={{ color: 'rgba(255,255,255,.3)' }}>
            ← Ver tienda
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}

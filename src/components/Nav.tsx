'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { href: '/',           label: 'Inicio' },
  { href: '/catalogo',   label: 'Catálogo' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#nosotros',  label: 'Nosotros' },
]

export default function Nav({ cantidadCarrito = 0 }: { cantidadCarrito?: number }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || !isHome || menuOpen

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: solid ? 'rgba(26,10,16,.96)' : 'transparent',
          backdropFilter: solid ? 'blur(16px)' : 'none',
          borderBottom: solid ? '1px solid rgba(255,255,255,.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-900"
              style={{ background: 'var(--gold)', color: '#fff' }}
            >
              R
            </span>
            <span className="text-base font-900" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
              Regalos<span style={{ color: 'var(--gold)' }}>Para</span>Todos
            </span>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-600 no-underline transition-colors"
                  style={{ color: active ? 'var(--gold)' : 'rgba(255,255,255,.6)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = active ? 'var(--gold)' : 'rgba(255,255,255,.6)')}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-3">
            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-700 no-underline transition-all hover:scale-105"
              style={{ background: 'var(--gold)', color: '#fff' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="hidden sm:inline">Carrito</span>
              {cantidadCarrito > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-800"
                  style={{ background: 'var(--fg)', color: '#fff' }}
                >
                  {cantidadCarrito}
                </span>
              )}
            </Link>

            {/* Hamburger mobile */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-5 h-0.5 transition-all"
                  style={{ background: 'rgba(255,255,255,.8)' }}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden px-6 pb-6 flex flex-col gap-4"
            style={{ background: 'rgba(26,10,16,.98)' }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-base font-600 no-underline py-2"
                style={{ color: 'rgba(255,255,255,.75)', borderBottom: '1px solid rgba(255,255,255,.07)' }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Nav({ cantidadCarrito = 0 }: { cantidadCarrito?: number }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || !isHome

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all"
      style={{
        background: solid ? 'rgba(43,10,26,.93)' : 'transparent',
        backdropFilter: solid ? 'blur(14px)' : 'none',
      }}
    >
      <Link
        href="/"
        className="text-base font-black no-underline"
        style={{ color: solid ? '#fff' : 'var(--fg)' }}
      >
        Regalos<span style={{ color: 'var(--gold)' }}>Para</span>Todos
      </Link>

      <div className="hidden md:flex gap-6">
        {[
          { href: '/catalogo', label: 'Catálogo' },
          { href: '/#como-funciona', label: 'Cómo funciona' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm font-600 no-underline transition-colors"
            style={{ color: solid ? 'rgba(255,255,255,.65)' : 'rgba(43,10,26,.6)' }}
          >
            {label}
          </Link>
        ))}
      </div>

      <Link
        href="/carrito"
        className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-700 no-underline"
        style={{ background: 'var(--gold)', color: '#fff' }}
      >
        🛒 Carrito
        {cantidadCarrito > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-800"
            style={{ background: 'var(--fg)', color: '#fff' }}
          >
            {cantidadCarrito}
          </span>
        )}
      </Link>
    </nav>
  )
}

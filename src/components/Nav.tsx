'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavProps {
  cantidadCarrito?: number
}

const COLECCIONES = [
  { emoji: '🎂', label: 'Cumpleaños', href: '/catalogo?cat=Cumpleaños', color: '#FFF0E0' },
  { emoji: '💕', label: 'Parejas', href: '/catalogo?cat=Parejas', color: '#FFE8F0' },
  { emoji: '👩', label: 'Para Ella', href: '/catalogo?cat=Para ella', color: '#F0E8FF' },
  { emoji: '👨', label: 'Para Él', href: '/catalogo?cat=Para él', color: '#E8F4FF' },
  { emoji: '👶', label: 'Bebés', href: '/catalogo?cat=Bebé', color: '#E8FFF0' },
]

export default function Nav({ cantidadCarrito = 0 }: NavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [colOpen, setColOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#fff',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,.08)' : 'none',
        transition: 'box-shadow .3s, border-color .3s',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(12px, 4vw, 24px)', height: 72 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--dark-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🎁
          </span>
          <span style={{ fontWeight: 700, fontSize: 'clamp(14px, 4vw, 18px)', color: 'var(--fg)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 800 }}>Regalos</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>ParaTodos</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8" style={{ position: 'relative' }}>
          {[
            { label: 'Inicio', href: '/' },
            { label: 'Catálogo', href: '/catalogo' },
            { label: 'Nosotros', href: '/#nosotros' },
            { label: 'Cómo funciona', href: '/#como-funciona' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--fg)',
                textDecoration: 'none',
                transition: 'color .2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--green)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--fg)')}
            >
              {link.label}
            </Link>
          ))}

          {/* Colecciones dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setColOpen(true)}
            onMouseLeave={() => setColOpen(false)}
          >
            <button
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: colOpen ? 'var(--green)' : 'var(--fg)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
                transition: 'color .2s',
                fontFamily: 'inherit',
              }}
            >
              Colecciones
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform .2s', transform: colOpen ? 'rotate(180deg)' : 'none' }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {colOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 16,
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  boxShadow: '0 16px 48px rgba(0,0,0,.14)',
                  padding: 20,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 12,
                  width: 480,
                  zIndex: 100,
                }}
              >
                {/* Arrow pointer */}
                <div style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 8,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    transform: 'rotate(45deg)',
                    margin: '4px auto 0',
                  }} />
                </div>

                {COLECCIONES.map((col) => (
                  <Link
                    key={col.label}
                    href={col.href}
                    onClick={() => setColOpen(false)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      textDecoration: 'none',
                      padding: '12px 8px',
                      borderRadius: 12,
                      background: col.color,
                      transition: 'transform .2s, box-shadow .2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.10)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{col.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', textAlign: 'center' }}>{col.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/carrito" style={{ position: 'relative', textDecoration: 'none', color: 'var(--fg)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cantidadCarrito > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: 'var(--blue)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cantidadCarrito}
              </span>
            )}
          </Link>

          {/* Contact Us button */}
          <span className="hidden md:flex">
            <Link href="/catalogo" className="btn-dark">
              Ver Cajas
            </Link>
          </span>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--fg)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '16px 24px 24px' }}>
          {[
            { label: 'Inicio', href: '/' },
            { label: 'Catálogo', href: '/catalogo' },
            { label: 'Nosotros', href: '/#nosotros' },
            { label: 'Cómo funciona', href: '/#como-funciona' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '12px 0', fontSize: 15, fontWeight: 500, color: 'var(--fg)', textDecoration: 'none', borderBottom: '1px solid var(--border-soft)' }}
            >
              {link.label}
            </Link>
          ))}
          {/* Colecciones en mobile */}
          <div style={{ marginTop: 8, marginBottom: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 0 6px' }}>Colecciones</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {COLECCIONES.map((col) => (
                <Link
                  key={col.label}
                  href={col.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 8px', borderRadius: 10, background: col.color,
                    textDecoration: 'none', fontSize: 12, fontWeight: 600, color: 'var(--fg)',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{col.emoji}</span>
                  {col.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/catalogo" className="btn-dark" style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
            Ver Cajas
          </Link>
        </div>
      )}
    </header>
  )
}

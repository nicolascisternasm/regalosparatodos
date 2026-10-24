'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import Link from 'next/link'
import type { Caja } from '@/types'

/* ============================
   DATA
   ============================ */
const FEATURES_LEFT = [
  { icon: '✦', title: 'Armado a mano', desc: 'Cada caja se prepara con cuidado y dedicación.' },
  { icon: '🚚', title: 'Despacho a todo Chile', desc: 'Enviamos vía Starken los martes y jueves.' },
  { icon: '💌', title: 'Tarjeta personalizada', desc: 'Incluye un mensaje especial para quien recibe.' },
]

const FEATURES_RIGHT = [
  { icon: '🎁', title: 'Variedad de productos', desc: 'Más de 6 categorías únicas para cada ocasión.' },
  { icon: '⏰', title: 'Entrega rápida', desc: 'Despacho en 48 hrs desde confirmación del pedido.' },
  { icon: '💰', title: 'Precio justo', desc: 'El mejor regalo sin que tu bolsillo lo sienta.' },
]

const DARK_FEATURES = [
  { icon: '🎀', label: 'Personalizable' },
  { icon: '🔒', label: 'Seguro' },
  { icon: '⭐', label: 'Premium' },
  { icon: '🌿', label: 'Ecológico' },
]

const CATEGORIA_EMOJI: Record<string, string> = {
  'cumpleaños': '🎂', 'cumpleanios': '🎂',
  'parejas': '💕', 'pareja': '💕',
  'para ella': '👩', 'para ellas': '👩',
  'para él': '👨', 'para el': '👨', 'para ellos': '👨',
  'bebés': '👶', 'bebes': '👶', 'bebé': '👶', 'bebe': '👶',
  'huelitas': '🐾', 'mascotas': '🐾',
  'para celebrar': '🎉', 'celebrar': '🎉',
  'aniversario': '💍', 'navidad': '🎄', 'amor': '❤️',
}

function getCategoriaEmoji(categoria: string): string {
  return CATEGORIA_EMOJI[categoria.toLowerCase().trim()] ?? '🎁'
}

const TESTIMONIALS = [
  {
    name: 'María González',
    role: 'Estudiante universitaria',
    text: 'La caja llegó perfectamente armada y con una presentación hermosa. ¡Mi amiga quedó emocionada!',
    rating: 5,
    avatar: '👩‍🦱',
  },
  {
    name: 'Pedro Valenzuela',
    role: 'Profesional TI',
    text: 'Busqué por todos lados algo original para el aniversario. Regalos Para Todos lo resolvió en minutos.',
    rating: 5,
    avatar: '👨',
  },
  {
    name: 'Valentina Ríos',
    role: 'Mamá feliz',
    text: 'Perfecto para el baby shower. Muy bonita presentación y llegó exactamente como en las fotos.',
    rating: 5,
    avatar: '👩',
  },
]

const SLIDES = [
  {
    subtitle: 'Despacho rápido a todo Chile',
    title1: 'El regalo perfecto',
    title2: 'para cada momento',
    emoji: '🎁',
  },
  {
    subtitle: 'Armado con cariño, entregado con amor',
    title1: 'Sorprende a quien',
    title2: 'más quieres',
    emoji: '🎀',
  },
]

/* ============================
   PAGE
   ============================ */
export default function Home() {
  const [cajas, setCajas] = useState<Caja[]>([])
  const [todasCajas, setTodasCajas] = useState<Caja[]>([])
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    fetch('/api/catalogo')
      .then((r) => r.json())
      .then(({ cajas }) => {
        const todas = cajas ?? []
        setTodasCajas(todas)
        setCajas(todas.slice(0, 4))
      })
      .catch(() => {})
  }, [])

  const categoriasUnicas = [...new Set(todasCajas.map((c) => c.categoria))].filter(Boolean)

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[slideIdx]

  return (
    <>
      <Nav cantidadCarrito={0} />

      {/* =============================================
          HERO — fondo gris claro, split layout
          ============================================= */}
      <section
        style={{
          background: 'var(--bg-hero)',
          minHeight: '100vh',
          paddingTop: 72,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="hero-grid"
          style={{
            flex: 1,
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            alignItems: 'center',
            minHeight: 'calc(100vh - 72px - 80px)',
          }}
        >
          {/* Left — text */}
          <div style={{ paddingTop: 40, paddingBottom: 40 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--fg-muted)',
                marginBottom: 20,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {slide.subtitle}
            </p>
            <h1
              style={{
                fontSize: 'clamp(28px, 6vw, 60px)',
                fontWeight: 300,
                color: 'var(--fg)',
                lineHeight: 1.15,
                marginBottom: 0,
              }}
            >
              {slide.title1}
            </h1>
            <h1
              style={{
                fontSize: 'clamp(36px, 8vw, 80px)',
                fontWeight: 700,
                color: 'var(--fg)',
                lineHeight: 1.1,
                marginBottom: 32,
              }}
            >
              {slide.title2}
            </h1>

            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn-primary">
                Comprar ahora
              </Link>
              <Link href="/#como-funciona" className="btn-outline">
                ▷&nbsp; Cómo funciona
              </Link>
            </div>

            {/* Slide dots */}
            <div className="flex gap-2" style={{ marginTop: 40 }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  style={{
                    width: i === slideIdx ? 28 : 8,
                    height: 8,
                    borderRadius: 100,
                    background: i === slideIdx ? 'var(--fg)' : 'var(--border)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'width .3s, background .3s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right — product image */}
          <div
            className="hidden md:flex"
            style={{ alignItems: 'center', justifyContent: 'center', padding: '60px 0 40px', position: 'relative' }}
          >
            {/* Decorative rings */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {[220, 320, 420].map((size, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: size, height: size,
                  borderRadius: '50%',
                  border: `1px solid rgba(0,0,0,${0.05 - i * 0.012})`,
                }} />
              ))}
            </div>

            {/* Main product — tall portrait, no card box */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div
                style={{
                  width: 340,
                  height: 440,
                  borderRadius: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/hero-caja.jpg"
                  alt="Caja de regalo premium"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
              </div>

              {/* Rating badge — top right */}
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  right: -32,
                  background: '#fff',
                  borderRadius: 12,
                  padding: '10px 16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,.14)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'var(--fg)',
                  whiteSpace: 'nowrap',
                }}
              >
                ⭐ 4.9 / 5.0
              </div>

              {/* Shipping badge — bottom left */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 40,
                  left: -32,
                  background: 'var(--green)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  boxShadow: '0 8px 32px rgba(130,180,64,.5)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}
              >
                🚚 Envío Chile
              </div>

              {/* Category chip — bottom center */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--fg)',
                  borderRadius: 100,
                  padding: '8px 20px',
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                }}
              >
                Cajas para toda ocasión
              </div>
            </div>
          </div>
        </div>

        {/* Category strip — black */}
        <div style={{ background: 'var(--dark-bg)', width: '100%' }}>
          <div
            style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
            className="flex overflow-x-auto"
          >
            {categoriasUnicas.map((cat) => (
              <Link
                key={cat}
                href={`/catalogo?cat=${encodeURIComponent(cat)}`}
                className="cat-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '20px 32px',
                  color: 'rgba(255,255,255,.75)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(255,255,255,.08)',
                  transition: 'color .2s, background .2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.07)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,.75)'
                }}
              >
                <span style={{ fontSize: 22 }}>{getCategoriaEmoji(cat)}</span>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          FEATURES — 3 columns: features | product | features
          ============================================= */}
      <section className="section-padding" style={{ background: '#fff', padding: '100px 24px' }}>
        <div
          className="features-grid"
          style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48, alignItems: 'center' }}
        >
          {/* Left */}
          <div className="flex flex-col gap-8">
            {FEATURES_LEFT.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(130,180,64,.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 4, lineHeight: '25.2px' }}>{f.title}</h3>
                  <p style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: '26px' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Center product */}
          <div className="features-center flex items-center justify-center" style={{ position: 'relative' }}>
            <div
              style={{
                width: 260,
                height: 320,
                background: 'linear-gradient(145deg, #F0F0F0 0%, #E6E6E6 100%)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 100,
                boxShadow: '0 24px 64px rgba(0,0,0,.10)',
                position: 'relative',
              }}
            >
              🎁
              {/* Corner dots */}
              {[
                { top: '18%', right: -30 },
                { bottom: '18%', right: -30 },
                { top: '18%', left: -30 },
                { bottom: '18%', left: -30 },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    ...pos,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    boxShadow: '0 0 0 4px rgba(130,180,64,.2)',
                  }}
                />
              ))}
              {/* Horizontal guide lines */}
              {['18%', '82%'].map((top) => (
                <div
                  key={top}
                  style={{
                    position: 'absolute',
                    top,
                    left: -30,
                    right: -30,
                    height: 1,
                    background: 'rgba(0,0,0,.08)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-8">
            {FEATURES_RIGHT.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(130,180,64,.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 4, lineHeight: '25.2px' }}>{f.title}</h3>
                  <p style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: '26px' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          DARK SECTION — producto con badges circulares
          ============================================= */}
      <section
        id="nosotros"
        className="section-padding"
        style={{
          background: 'var(--dark-bg)',
          padding: '100px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dot texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          {/* Header */}
          <div className="text-center" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              RegalosParaTodos
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', maxWidth: 520, margin: '0 auto', lineHeight: 2 }}>
              Creamos experiencias de regalo únicas. Tú eliges la categoría, nosotros armamos y despachamos.
            </p>
          </div>

          {/* Badges + product */}
          <div className="flex items-center justify-center flex-wrap" style={{ gap: 60 }}>
            {/* Left badges */}
            <div className="flex flex-col gap-8">
              {DARK_FEATURES.slice(0, 2).map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-3">
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                      background: 'rgba(255,255,255,.06)',
                    }}
                  >
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,.65)' }}>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Center product */}
            <div
              style={{
                width: 240,
                height: 300,
                borderRadius: 16,
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 100,
                boxShadow: '0 0 60px rgba(130,180,64,.15)',
              }}
            >
              🎁
            </div>

            {/* Right badges */}
            <div className="flex flex-col gap-8">
              {DARK_FEATURES.slice(2, 4).map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-3">
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                      background: 'rgba(255,255,255,.06)',
                    }}
                  >
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,.65)' }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center flex-wrap" style={{ marginTop: 72, gap: 'clamp(24px, 5vw, 64px)' }}>
            {[
              { num: '+200', label: 'Pedidos enviados' },
              { num: '100%', label: 'Armado a mano' },
              { num: '4.9★', label: 'Calificación promedio' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p style={{ fontSize: 38, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{s.num}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          PRODUCT GRID
          ============================================= */}
      <section className="section-padding" style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: 48 }}>
            <div>
              <p className="section-label">Nuestras cajas</p>
              <h2 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: 'var(--fg)', lineHeight: 1.4, marginBottom: 12 }}>Elige tu caja perfecta</h2>
              <p className="section-desc">
                Todas armadas a mano y despachadas desde Talagante vía Starken.
              </p>
            </div>
            <Link href="/catalogo" className="btn-outline">
              Ver todo el catálogo →
            </Link>
          </div>

          {cajas.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 24,
              }}
            >
              {cajas.map((caja) => (
                <ProductCard key={caja.id} caja={caja} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 340, background: '#F0F0F0', borderRadius: 4 }} />
              ))}
            </div>
          )}

          <div className="flex justify-center" style={{ marginTop: 40 }}>
            <Link href="/catalogo" className="btn-primary">
              Descubrir más ↓
            </Link>
          </div>
        </div>
      </section>

      {/* =============================================
          CÓMO FUNCIONA
          ============================================= */}
      <section id="como-funciona" className="section-padding" style={{ background: 'var(--bg-soft)', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="text-center" style={{ marginBottom: 64 }}>
            <p className="section-label">Simple y sin complicaciones</p>
            <h2 className="section-title">Cómo funciona</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            {[
              { n: '01', icon: '🔍', title: 'Elige tu caja', desc: 'Navega el catálogo y selecciona la caja que mejor se ajuste a la persona y la ocasión.' },
              { n: '02', icon: '✍️', title: 'Personaliza el mensaje', desc: 'Agrega un mensaje de tarjeta especial que irá incluido dentro de la caja.' },
              { n: '03', icon: '📦', title: 'Nosotros enviamos', desc: 'Armamos la caja con cuidado y la despachamos directo a quien quieras sorprender.' },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '40px 32px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 20,
                    fontSize: 80,
                    fontWeight: 800,
                    color: 'rgba(130,180,64,.07)',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {step.n}
                </span>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 20,
                  }}
                >
                  {step.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.8 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          TESTIMONIALS
          ============================================= */}
      <section className="section-padding" style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="text-center" style={{ marginBottom: 48 }}>
            <p className="section-label">Testimonios</p>
            <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'var(--bg-soft)', borderRadius: 8, padding: '32px 28px' }}>
                <span style={{ fontSize: 48, color: 'var(--green)', lineHeight: 1, fontFamily: 'Georgia, serif', display: 'block', marginBottom: 8, opacity: 0.5 }}>
                  "
                </span>
                <p style={{ fontSize: 15, color: 'var(--fg)', lineHeight: 1.8, marginBottom: 20 }}>{t.text}</p>
                <div className="stars" style={{ fontSize: 14, marginBottom: 16 }}>
                  {'★'.repeat(t.rating)}
                </div>
                <div className="flex items-center gap-3">
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          DARK CTA
          ============================================= */}
      <section
        className="section-padding"
        style={{ background: 'var(--dark-bg)', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(130,180,64,.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(130,180,64,.06) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            background: 'radial-gradient(ellipse, rgba(130,180,64,.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="text-center" style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            Encuentra tu caja ideal
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 2 }}>
            Regalos únicos para cada persona y ocasión especial. Armados a mano y enviados con amor.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/catalogo" className="btn-primary">Comprar ahora</Link>
            <Link href="/#como-funciona" className="btn-outline-white">Ver cómo funciona</Link>
          </div>
        </div>
      </section>

      {/* =============================================
          FOOTER
          ============================================= */}
      <footer style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 40 }}>
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>🎁</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--fg)' }}>
                  Regalos<span style={{ color: 'var(--green)' }}>ParaTodos</span>
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.8, maxWidth: 240 }}>
                Cajas de regalo temáticas con despacho a todo Chile. Armadas con cariño desde Talagante.
              </p>
              <div className="flex gap-3" style={{ marginTop: 20 }}>
                {['◑', 'f', '♪'].map((icon, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: '1.5px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: 'var(--fg-muted)',
                      textDecoration: 'none',
                      transition: 'border-color .2s, color .2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-muted)' }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Menu */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Menú</h4>
              {[['Inicio', '/'], ['Catálogo', '/catalogo'], ['Cómo funciona', '/#como-funciona'], ['Nosotros', '/#nosotros']].map(([label, href]) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: 14, color: 'var(--fg-muted)', textDecoration: 'none', marginBottom: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--green)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}>
                  {label}
                </a>
              ))}
            </div>

            {/* Support */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Soporte</h4>
              {['Preguntas frecuentes', 'Términos y condiciones', 'Política de privacidad', 'Contacto'].map((item) => (
                <a key={item} href="#" style={{ display: 'block', fontSize: 14, color: 'var(--fg-muted)', textDecoration: 'none', marginBottom: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--green)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}>
                  {item}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>Mantente al día</h4>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Recibe novedades y descuentos antes que nadie.
              </p>
              <form className="footer-form flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  style={{ flex: 1, padding: '10px 16px', fontSize: 14, border: '1.5px solid var(--border)', borderRadius: 100, outline: 'none', color: 'var(--fg)' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                  Suscribir
                </button>
              </form>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="flex flex-wrap justify-between items-center gap-4"
            style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}
          >
            <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>© 2024 RegalosParaTodos. Todos los derechos reservados.</p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Talagante, Región Metropolitana · Chile 🇨🇱</p>
              <a
                href="/admin"
                style={{ fontSize: 12, color: 'var(--fg-muted)', textDecoration: 'none', opacity: 0.5 }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}
              >
                Administración
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
            padding-top: 40px !important;
            padding-bottom: 40px !important;
          }
          .features-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .features-center { display: none !important; }
          .hero-padding { padding: 40px 0 !important; }
          .section-padding { padding-top: 60px !important; padding-bottom: 60px !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-form { flex-direction: column !important; }
          .footer-form input { width: 100% !important; }
          .footer-form button { width: 100% !important; justify-content: center; }
          .cat-item { padding: 14px 18px !important; }
          .hero-dots { margin-top: 24px !important; }
        }
      `}</style>
    </>
  )
}

/* ============================
   PRODUCT CARD
   ============================ */
function ProductCard({ caja }: { caja: Caja }) {
  const [agregado, setAgregado] = useState(false)
  const descuento = caja.precio_original
    ? Math.round((1 - caja.precio / caja.precio_original) * 100)
    : null

  function handleAgregar() {
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1800)
  }

  return (
    <article className="product-card" style={{ border: '1px solid var(--border-soft)' }}>
      <div
        style={{
          height: 220,
          background: 'linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {descuento && (
          <span className="badge-sale" style={{ position: 'absolute', top: 12, left: 12 }}>
            -{descuento}%
          </span>
        )}
        {caja.imagen_url ? (
          <img
            src={caja.imagen_url}
            alt={caja.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        ) : (
          <span style={{ fontSize: 80, transition: 'transform .3s' }} role="img" aria-label={caja.nombre}>
            {caja.emoji}
          </span>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        <span className="badge-cat">{caja.categoria}</span>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg)', margin: '8px 0 4px', lineHeight: 1.3 }}>
          {caja.nombre}
        </h3>
        <div className="stars" style={{ fontSize: 13, marginBottom: 12 }}>★★★★★</div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>
              ${caja.precio.toLocaleString('es-CL')}
            </span>
            {caja.precio_original && (
              <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--fg-muted)', marginLeft: 8 }}>
                ${caja.precio_original.toLocaleString('es-CL')}
              </span>
            )}
          </div>
          <button
            onClick={handleAgregar}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 12, background: agregado ? '#2DA44E' : undefined, borderColor: agregado ? '#2DA44E' : undefined }}
          >
            {agregado ? '✓' : '+ Agregar'}
          </button>
        </div>
      </div>
    </article>
  )
}

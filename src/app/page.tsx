import Nav from '@/components/Nav'
import Link from 'next/link'

/* =========================================================
   HOMEPAGE — adaptado visualmente de xtratheme watch-shop
   ========================================================= */

export default function HomePage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--bg)' }}>

        {/* ── 1. HERO SPLIT ──────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: 'var(--dark-bg)' }}
        >
          {/* Anillos concéntricos (fondo derecho) */}
          <div className="radial-rings" />

          <div className="max-w-7xl mx-auto w-full px-6 pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">

            {/* Columna izquierda — features + CTA */}
            <div className="fade-up">
              <p
                className="text-xs font-700 uppercase tracking-widest mb-5"
                style={{ color: 'var(--gold)' }}
              >
                Regalos únicos para cada persona
              </p>
              <h1
                className="text-5xl md:text-6xl font-900 mb-6 leading-tight"
                style={{ color: '#fff', letterSpacing: '-0.03em' }}
              >
                El regalo<br />
                <span style={{ color: 'var(--gold)' }}>perfecto</span><br />
                existe.
              </h1>

              {/* Lista de features */}
              <ul className="space-y-4 mb-10">
                {[
                  { icon: '🚚', titulo: 'Envío a todo Chile', desc: 'Despachamos vía Starken martes y jueves.' },
                  { icon: '🎀', titulo: 'Armado a mano', desc: 'Cada caja se prepara con atención al detalle.' },
                  { icon: '💬', titulo: 'Atención por WhatsApp', desc: 'Coordinas el pago y los detalles con nosotros.' },
                  { icon: '💝', titulo: 'Con tarjeta personalizada', desc: 'Tu mensaje escrito a mano para el destinatario.' },
                ].map(({ icon, titulo, desc }) => (
                  <li key={titulo} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-700 text-sm" style={{ color: '#fff' }}>{titulo}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,.45)' }}>{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/catalogo"
                  className="px-8 py-4 rounded-full font-800 text-base no-underline transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--gold)', color: '#fff', boxShadow: '0 8px 30px rgba(255,107,138,.45)' }}
                >
                  Explorar cajas →
                </Link>
                <Link
                  href="#como-funciona"
                  className="px-8 py-4 rounded-full font-600 text-base no-underline"
                  style={{ border: '1.5px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)' }}
                >
                  Cómo funciona
                </Link>
              </div>
            </div>

            {/* Columna derecha — producto protagonista */}
            <div className="relative flex items-center justify-center min-h-80">
              {/* Círculo de fondo */}
              <div
                className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,107,138,.18) 0%, rgba(255,107,138,.04) 60%, transparent 80%)' }}
              />
              {/* Producto (placeholder reemplazable por imagen real) */}
              <div
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl flex items-center justify-center text-9xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,107,138,.15) 0%, rgba(255,159,69,.10) 100%)',
                  border: '1px solid rgba(255,107,138,.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* REEMPLAZAR: imagen real de caja regalo */}
                🎁
                <div
                  className="absolute -top-3 -right-3 text-4xl"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}
                >
                  ✨
                </div>
              </div>

              {/* Badges flotantes */}
              <div
                className="absolute top-6 left-8 px-3 py-2 rounded-xl text-xs font-700"
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', backdropFilter: 'blur(8px)' }}
              >
                🌟 +50 cajas disponibles
              </div>
              <div
                className="absolute bottom-10 right-4 px-3 py-2 rounded-xl text-xs font-700"
                style={{ background: 'rgba(255,107,138,.2)', border: '1px solid rgba(255,107,138,.3)', color: 'var(--gold)', backdropFilter: 'blur(8px)' }}
              >
                🚚 Despacho martes y jueves
              </div>
            </div>
          </div>

          {/* Flecha scroll */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </section>

        {/* ── 2. SECCIÓN OSCURA — características principales ── */}
        <section
          className="py-24 px-6 relative overflow-hidden"
          style={{ background: 'var(--dark-card)' }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
              RegalosParaTodos
            </p>
            <h2
              className="text-3xl md:text-4xl font-900 mb-4 leading-tight"
              style={{ color: '#fff', letterSpacing: '-0.02em' }}
            >
              Un regalo armado con amor<br />
              <span style={{ color: 'var(--gold)' }}>directo a quien quieres</span>
            </h2>
            <p className="text-base mb-16 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,.5)' }}>
              Tú eliges la categoría, nosotros armamos la caja y la enviamos con tarjeta personalizada directo al destinatario, donde sea en Chile.
            </p>

            {/* Grilla de features con icono circular — igual a la referencia */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { icon: '🎀', label: 'Armado a mano' },
                { icon: '🚚', label: 'Envío a todo Chile' },
                { icon: '💳', label: 'Pago por transferencia' },
                { icon: '💬', label: 'Atención WhatsApp' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,107,138,.12)', border: '1.5px solid rgba(255,107,138,.25)' }}
                  >
                    {icon}
                  </div>
                  <p className="text-sm font-600" style={{ color: 'rgba(255,255,255,.7)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Imagen central grande */}
            <div
              className="mx-auto w-52 h-52 rounded-full flex items-center justify-center text-8xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,107,138,.2) 0%, rgba(255,107,138,.05) 60%, transparent 80%)',
                border: '1px solid rgba(255,107,138,.15)',
              }}
            >
              {/* REEMPLAZAR: imagen real del producto */}
              🎁
            </div>
          </div>
        </section>

        {/* ── 3. TICKER ANIMADO ─────────────────────────────── */}
        <div
          className="overflow-hidden py-4"
          style={{ background: 'var(--gold)', color: '#fff' }}
          aria-hidden="true"
        >
          <div className="ticker-track">
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="flex items-center gap-4 pr-12 text-sm font-800 uppercase tracking-wider whitespace-nowrap">
                ENVÍO MARTES Y JUEVES ⚡
                <span className="opacity-60">|</span>
                DESPACHO A TODO CHILE ⚡
                <span className="opacity-60">|</span>
                CAJAS ARMADAS A MANO ⚡
                <span className="opacity-60">|</span>
                PAGO POR TRANSFERENCIA ⚡
                <span className="opacity-60">|</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── 4. PRODUCTOS DESTACADOS ───────────────────────── */}
        <section id="catalogo-preview" className="py-24 px-6" style={{ background: '#fff' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--orange)' }}>
                Nuestras cajas
              </p>
              <h2
                className="text-3xl md:text-4xl font-900 mb-3"
                style={{ color: 'var(--fg)', letterSpacing: '-0.02em' }}
              >
                Para cada ocasión
              </h2>
              <p className="text-base" style={{ color: 'var(--muted)' }}>
                Cajas temáticas seleccionadas para cada tipo de persona y momento especial.
              </p>
            </div>

            {/* Mini-catálogo estático para la homepage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-12">
              {[
                { emoji: '❤️', cat: 'Amor', nombre: 'Caja Romántica', precio: 29990, desde: true },
                { emoji: '🎂', cat: 'Cumpleaños', nombre: 'Caja Celebración', precio: 24990, desde: true },
                { emoji: '👨‍👩‍👧', cat: 'Familia', nombre: 'Caja Familiar', precio: 34990, desde: true },
                { emoji: '🌟', cat: 'Ocasiones', nombre: 'Caja Premium', precio: 44990, desde: true },
              ].map(({ emoji, cat, nombre, precio, desde }) => (
                <Link
                  href="/catalogo"
                  key={nombre}
                  className="rounded-2xl overflow-hidden flex flex-col no-underline group transition-all hover:-translate-y-1.5"
                  style={{ border: '1.5px solid var(--border)', background: '#fff', boxShadow: '0 2px 8px rgba(43,10,26,.04)' }}
                >
                  <div
                    className="h-44 flex items-center justify-center text-7xl relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4EC 50%, #FFF8F0 100%)' }}
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110 inline-block">
                      {emoji}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <p className="text-xs font-700 uppercase tracking-wider" style={{ color: 'var(--orange)' }}>
                      {cat}
                    </p>
                    <p className="font-800 text-sm" style={{ color: 'var(--fg)' }}>{nombre}</p>
                    <p className="text-xs font-600 mt-1" style={{ color: 'var(--muted)' }}>
                      {desde ? 'Desde ' : ''}${precio.toLocaleString('es-CL')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-800 no-underline transition-all hover:scale-105"
                style={{ background: 'var(--dark-bg)', color: '#fff' }}
              >
                Ver todas las cajas →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 5. CÓMO FUNCIONA ──────────────────────────────── */}
        <section id="como-funciona" className="py-24 px-6" style={{ background: 'var(--bg-soft)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--orange)' }}>
                Proceso
              </p>
              <h2
                className="text-3xl md:text-4xl font-900 mb-3"
                style={{ color: 'var(--fg)', letterSpacing: '-0.02em' }}
              >
                Así de simple
              </h2>
              <p className="text-base" style={{ color: 'var(--muted)' }}>
                Desde que eliges hasta que llega a quien más quieres.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  n: '01',
                  emoji: '🎁',
                  titulo: 'Elige tu caja',
                  desc: 'Navega el catálogo y agrega al carrito las cajas que más te gusten. Cada categoría tiene opciones para distintos presupuestos.',
                },
                {
                  n: '02',
                  emoji: '📝',
                  titulo: 'Confirma el pedido',
                  desc: 'Ingresa los datos de entrega, un mensaje para la tarjeta y confirma. Coordinamos el pago contigo por WhatsApp.',
                },
                {
                  n: '03',
                  emoji: '🚚',
                  titulo: 'Lo enviamos',
                  desc: 'Verificamos el pago y despachamos vía Starken martes y jueves. Tú puedes seguir el pedido desde el sistema.',
                },
              ].map((paso) => (
                <div
                  key={paso.n}
                  className="rounded-2xl p-7 relative overflow-hidden"
                  style={{ background: '#fff', border: '1.5px solid var(--border)' }}
                >
                  {/* Número decorativo de fondo */}
                  <p
                    className="absolute top-4 right-5 font-900 select-none pointer-events-none"
                    style={{ color: 'rgba(255,107,138,.07)', fontSize: 64, lineHeight: 1 }}
                  >
                    {paso.n}
                  </p>
                  <div className="text-4xl mb-5">{paso.emoji}</div>
                  <h3 className="font-800 text-lg mb-2" style={{ color: 'var(--fg)' }}>{paso.titulo}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{paso.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. NOSOTROS (split lifestyle) ─────────────────── */}
        <section
          id="nosotros"
          className="py-24 px-6 relative overflow-hidden"
          style={{ background: 'var(--dark-bg)' }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

            {/* Texto */}
            <div>
              <p className="text-xs font-700 uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>
                Quiénes somos
              </p>
              <h2
                className="text-3xl md:text-4xl font-900 mb-6 leading-tight"
                style={{ color: '#fff', letterSpacing: '-0.02em' }}
              >
                Un emprendimiento<br />
                hecho con <span style={{ color: 'var(--gold)' }}>amor</span>
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,.55)' }}>
                Somos un emprendimiento familiar nacido en Talagante. Creemos que un regalo bien elegido puede hacer la diferencia en el día de alguien.
              </p>
              <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,.55)' }}>
                Cada caja la armamos personalmente, con productos seleccionados y un mensaje escrito a mano. Queremos que quien recibe la caja sienta que alguien pensó en él.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/catalogo"
                  className="px-7 py-3.5 rounded-full font-800 no-underline transition-all hover:scale-105"
                  style={{ background: 'var(--gold)', color: '#fff', boxShadow: '0 6px 24px rgba(255,107,138,.4)' }}
                >
                  Ver catálogo
                </Link>
                <a
                  href={`https://wa.me/56912345678?text=Hola%2C%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20sus%20cajas%20regalo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3.5 rounded-full font-700 no-underline transition-all hover:scale-105"
                  style={{ border: '1.5px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)' }}
                >
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>

            {/* Imagen lifestyle — REEMPLAZAR por foto real */}
            <div className="relative flex items-center justify-center">
              <div
                className="w-full max-w-sm aspect-[3/4] rounded-3xl flex flex-col items-center justify-center gap-4"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,107,138,.15) 0%, rgba(255,107,138,.05) 100%)',
                  border: '1px solid rgba(255,107,138,.2)',
                }}
              >
                <span className="text-7xl">🎁</span>
                <p className="text-sm font-700 text-center px-8" style={{ color: 'rgba(255,255,255,.5)' }}>
                  {/* REEMPLAZAR: imagen del equipo o del proceso de armado */}
                  [Foto del equipo o proceso de armado]
                </p>
              </div>
              {/* Stat flotante */}
              <div
                className="absolute -bottom-4 -left-4 px-5 py-4 rounded-2xl"
                style={{ background: 'var(--gold)', color: '#fff' }}
              >
                <p className="font-900 text-2xl">100%</p>
                <p className="text-xs font-600">Armado a mano</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. FOOTER ──────────────────────────────────────── */}
        <footer style={{ background: '#110508' }}>
          {/* Newsletter */}
          <div
            className="border-b px-6 py-14"
            style={{ borderColor: 'rgba(255,255,255,.06)' }}
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="font-900 text-xl mb-1" style={{ color: '#fff' }}>
                  ¿Quieres enterarte de novedades?
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
                  Nuevas cajas, descuentos y más. Sin spam.
                </p>
              </div>
              {/* FUNCIONALIDAD PENDIENTE: suscripción por email */}
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 md:w-56 px-4 py-3 rounded-full text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: '#fff' }}
                />
                <button
                  className="px-5 py-3 rounded-full text-sm font-700 flex-shrink-0"
                  style={{ background: 'var(--gold)', color: '#fff' }}
                >
                  Suscribir
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="px-6 py-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-900"
                    style={{ background: 'var(--gold)', color: '#fff' }}
                  >
                    R
                  </span>
                  <span className="font-900 text-base" style={{ color: '#fff' }}>
                    Regalos<span style={{ color: 'var(--gold)' }}>Para</span>Todos
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,.35)' }}>
                  Cajas regalo armadas con amor desde Talagante, Chile. Despachamos a todo el país vía Starken.
                </p>
              </div>

              {/* Menú */}
              <div>
                <p className="text-xs font-700 uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,.3)' }}>
                  Menú
                </p>
                <ul className="space-y-2.5">
                  {[
                    { href: '/catalogo', label: 'Catálogo' },
                    { href: '/#como-funciona', label: 'Cómo funciona' },
                    { href: '/#nosotros', label: 'Nosotros' },
                    { href: '/carrito', label: 'Carrito' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm no-underline hover:underline" style={{ color: 'rgba(255,255,255,.45)' }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <p className="text-xs font-700 uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,.3)' }}>
                  Contacto
                </p>
                <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,.45)' }}>
                  <li>📍 Talagante, Chile</li>
                  <li>
                    <a
                      href="https://wa.me/56912345678"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline hover:underline"
                      style={{ color: 'rgba(255,255,255,.45)' }}
                    >
                      💬 WhatsApp
                    </a>
                  </li>
                  <li>🚚 Despachos mar. y jue.</li>
                </ul>
              </div>
            </div>

            <div
              className="mt-12 pt-6 flex items-center justify-between flex-wrap gap-4"
              style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}
            >
              <p className="text-xs" style={{ color: 'rgba(255,255,255,.2)' }}>
                © {new Date().getFullYear()} RegalosParaTodos.cl — Todos los derechos reservados
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,.2)' }}>
                Talagante, Región Metropolitana, Chile
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

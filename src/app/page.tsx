import Nav from '@/components/Nav'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #FFF0F3 0%, #FFE0EC 45%, #FFF5F0 100%)' }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 600, height: 600, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,107,138,.12) 0%, transparent 70%)',
              top: -200, right: -200,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,159,69,.10) 0%, transparent 70%)',
              bottom: -100, left: -100,
            }}
          />

          <div className="max-w-2xl relative">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-700 uppercase tracking-widest mb-6"
              style={{ background: 'rgba(255,107,138,.12)', border: '1px solid rgba(255,107,138,.3)', color: 'var(--gold)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
              Despacho a todo Chile
            </div>
            <h1
              className="text-5xl md:text-7xl font-900 mb-6 leading-tight"
              style={{ color: 'var(--fg)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Un regalo para<br />
              <span style={{ color: 'var(--gold)' }}>cada persona</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
              Cajas temáticas seleccionadas con amor. Tú eliges la categoría, nosotros armamos y enviamos directo al destinatario.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/catalogo"
                className="px-8 py-4 rounded-full font-800 text-base no-underline transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--gold)', color: '#fff', boxShadow: '0 8px 30px rgba(255,107,138,.4)' }}
              >
                Explorar cajas →
              </Link>
              <Link
                href="#como-funciona"
                className="px-8 py-4 rounded-full font-600 text-base no-underline"
                style={{ border: '1.5px solid rgba(43,10,26,.2)', color: 'rgba(43,10,26,.65)', background: 'rgba(255,255,255,.6)' }}
              >
                ¿Cómo funciona?
              </Link>
            </div>
          </div>

          {/* Trust bar */}
          <div
            className="absolute bottom-10 left-6 right-6 flex items-center justify-center gap-8 flex-wrap"
            style={{ opacity: 0.7 }}
          >
            {[
              { icon: '🚚', text: 'Envío por Starken' },
              { icon: '🎁', text: 'Armado a mano' },
              { icon: '💬', text: 'Coordinas por WhatsApp' },
              { icon: '📍', text: 'Desde Talagante' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                <span>{icon}</span>
                <span className="font-600">{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Categorías destacadas */}
        <section className="py-20 px-6" style={{ background: '#fff' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--red)' }}>Catálogo</p>
              <h2 className="text-3xl md:text-4xl font-900 mb-3" style={{ color: 'var(--fg)' }}>Para cada ocasión</h2>
              <p className="text-base" style={{ color: 'var(--muted)' }}>Cajas perfectas para cumpleaños, aniversarios, o simplemente porque sí.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {[
                { emoji: '❤️', nombre: 'Amor & Pareja', color: '#FFEBEF', border: '#FFC0CB', desc: 'Para esa persona especial' },
                { emoji: '🎂', nombre: 'Cumpleaños', color: '#FFF3E0', border: '#FFD080', desc: 'Hazlo memorable' },
                { emoji: '👨‍👩‍👧', nombre: 'Familia', color: '#E8F5E9', border: '#A5D6A7', desc: 'Celebra juntos' },
                { emoji: '🌟', nombre: 'Ocasiones especiales', color: '#F3E5F5', border: '#CE93D8', desc: 'Logros que merecen celebrarse' },
                { emoji: '🎮', nombre: 'Hobbies', color: '#E3F2FD', border: '#90CAF9', desc: 'Según sus pasiones' },
                { emoji: '🎁', nombre: 'Sorpresa', color: '#FCE4EC', border: '#F48FB1', desc: 'Cuando no sabes qué regalar' },
              ].map((cat) => (
                <Link
                  key={cat.nombre}
                  href="/catalogo"
                  className="rounded-2xl p-5 flex flex-col gap-2 no-underline transition-all hover:-translate-y-1 hover:shadow-lg group"
                  style={{ background: cat.color, border: `1.5px solid ${cat.border}` }}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <p className="font-800 text-sm" style={{ color: 'var(--fg)' }}>{cat.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{cat.desc}</p>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-700 no-underline transition-all hover:scale-105"
                style={{ background: 'var(--gold)', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,138,.3)' }}
              >
                Ver todas las cajas →
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="py-20 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--red)' }}>Proceso</p>
            <h2 className="text-3xl md:text-4xl font-900 mb-3" style={{ color: 'var(--fg)' }}>Así de simple</h2>
            <p className="text-base mb-14" style={{ color: 'var(--muted)' }}>Desde que eliges hasta que llega, en 3 pasos.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: '01', emoji: '🎁', titulo: 'Elige tu caja', desc: 'Navega el catálogo y agrega al carrito las cajas que más te gusten según la ocasión.' },
                { n: '02', emoji: '📝', titulo: 'Confirma tu pedido', desc: 'Ingresa los datos de entrega y un mensaje para la tarjeta. Coordinamos todo por WhatsApp.' },
                { n: '03', emoji: '🚚', titulo: 'Lo enviamos', desc: 'Coordinas el pago por transferencia y despachamos vía Starken a todo Chile.' },
              ].map((paso) => (
                <div
                  key={paso.n}
                  className="rounded-2xl p-7 text-left relative overflow-hidden"
                  style={{ background: '#fff', border: '1.5px solid var(--border)' }}
                >
                  <p
                    className="absolute top-4 right-5 font-900 text-5xl pointer-events-none select-none"
                    style={{ color: 'rgba(255,107,138,.08)' }}
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

        {/* Por qué elegirnos */}
        <section className="py-20 px-6" style={{ background: '#fff' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--red)' }}>Beneficios</p>
              <h2 className="text-3xl font-900" style={{ color: 'var(--fg)' }}>¿Por qué RegalosParaTodos?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: '🎀', titulo: 'Armadas con cariño', desc: 'Cada caja se prepara manualmente con atención al detalle para que sea especial.' },
                { icon: '🏷️', titulo: 'Precios accesibles', desc: 'Regalos de calidad sin gastar de más. Opciones para todos los presupuestos.' },
                { icon: '✉️', titulo: 'Tarjeta personalizada', desc: 'Incluye un mensaje escrito a mano especialmente para el destinatario.' },
                { icon: '🚀', titulo: 'Despacho rápido', desc: 'Enviamos martes y jueves vía Starken a todo Chile desde Talagante.' },
              ].map(({ icon, titulo, desc }) => (
                <div
                  key={titulo}
                  className="flex gap-4 p-5 rounded-2xl"
                  style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}
                >
                  <span className="text-3xl mt-0.5 flex-shrink-0">{icon}</span>
                  <div>
                    <h3 className="font-800 mb-1" style={{ color: 'var(--fg)' }}>{titulo}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section
          className="py-20 px-6 text-center"
          style={{ background: 'linear-gradient(135deg, #2B0A1A 0%, #4A1025 100%)' }}
        >
          <p className="text-xs font-700 uppercase tracking-widest mb-4" style={{ color: 'rgba(255,107,138,.7)' }}>¿Listo?</p>
          <h2 className="text-3xl md:text-4xl font-900 mb-4" style={{ color: '#fff' }}>
            Sorprende a alguien hoy
          </h2>
          <p className="mb-8 text-base" style={{ color: 'rgba(255,255,255,.6)' }}>
            Elige entre nuestra selección de cajas temáticas y lleva alegría a quien más quieres.
          </p>
          <Link
            href="/catalogo"
            className="inline-block px-10 py-4 rounded-full font-800 no-underline transition-all hover:scale-105"
            style={{ background: 'var(--gold)', color: '#fff', boxShadow: '0 8px 30px rgba(255,107,138,.5)' }}
          >
            Ver catálogo →
          </Link>
        </section>

        {/* Footer */}
        <footer
          className="px-6 py-10"
          style={{ background: '#2B0A1A' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
              <div>
                <span className="font-900 text-xl" style={{ color: '#fff' }}>
                  Regalos<span style={{ color: 'var(--gold)' }}>Para</span>Todos
                </span>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>
                  Cajas regalo armadas con amor desde Talagante, Chile.
                </p>
              </div>
              <div className="flex gap-6">
                {[
                  { href: '/catalogo', label: 'Catálogo' },
                  { href: '/#como-funciona', label: 'Cómo funciona' },
                  { href: '/carrito', label: 'Carrito' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="text-sm no-underline hover:underline" style={{ color: 'rgba(255,255,255,.5)' }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,.3)' }}>
              © {new Date().getFullYear()} RegalosParaTodos.cl — Todos los derechos reservados
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}

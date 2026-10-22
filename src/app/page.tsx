import Nav from '@/components/Nav'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--bg)' }}>
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: 'linear-gradient(155deg, #FFF0F3 0%, #FFE0EC 45%, #FFF5F0 100%)' }}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-700 uppercase tracking-widest mb-6" style={{ background: 'rgba(255,107,138,.1)', border: '1px solid rgba(255,107,138,.3)', color: 'var(--gold)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
              Despacho a todo Chile
            </div>
            <h1 className="text-5xl md:text-6xl font-900 mb-6 leading-tight" style={{ color: 'var(--fg)', letterSpacing: '-0.02em' }}>
              Un regalo para<br /><span style={{ color: 'var(--gold)' }}>cada persona</span>
            </h1>
            <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--muted)' }}>
              Cajas temáticas seleccionadas con amor. Tú eliges la categoría, nosotros armamos y enviamos directo al destinatario.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/catalogo" className="px-8 py-4 rounded-full font-800 text-base no-underline" style={{ background: 'var(--gold)', color: '#fff' }}>
                Explorar cajas
              </Link>
              <Link href="#como-funciona" className="px-8 py-4 rounded-full font-600 text-base no-underline" style={{ border: '1.5px solid rgba(43,10,26,.25)', color: 'rgba(43,10,26,.7)' }}>
                ¿Cómo funciona?
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="py-20 px-6" style={{ background: '#fff' }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--red)' }}>Proceso</p>
            <h2 className="text-3xl font-900 mb-12" style={{ color: 'var(--fg)' }}>Así de simple</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: '1', emoji: '🎁', titulo: 'Elige tu caja', desc: 'Navega el catálogo y agrega al carrito las cajas que quieras.' },
                { n: '2', emoji: '📝', titulo: 'Confirma tu pedido', desc: 'Ingresa los datos de entrega y te redirigiremos a WhatsApp.' },
                { n: '3', emoji: '🚚', titulo: 'Lo enviamos', desc: 'Coordina el pago por transferencia y despachamos vía Starken.' },
              ].map((paso) => (
                <div key={paso.n} className="text-center">
                  <div className="text-4xl mb-4">{paso.emoji}</div>
                  <h3 className="font-800 mb-2" style={{ color: 'var(--fg)' }}>{paso.titulo}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{paso.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 text-center" style={{ background: 'linear-gradient(135deg, #FFE8F0, #FFD5E5)' }}>
          <h2 className="text-3xl font-900 mb-4" style={{ color: 'var(--fg)' }}>
            ¿Listo para sorprender a alguien?
          </h2>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            Elige entre nuestra selección de cajas temáticas con despacho a todo Chile.
          </p>
          <Link href="/catalogo" className="px-8 py-4 rounded-full font-800 no-underline" style={{ background: 'var(--gold)', color: '#fff' }}>
            Ver catálogo →
          </Link>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 flex items-center justify-between flex-wrap gap-4" style={{ background: '#FFE0EC', borderTop: '1px solid var(--border)' }}>
          <span className="font-900 text-base" style={{ color: 'var(--fg)' }}>
            Regalos<span style={{ color: 'var(--gold)' }}>Para</span>Todos
          </span>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} RegalosParaTodos.cl — Talagante, Chile
          </p>
        </footer>
      </main>
    </>
  )
}

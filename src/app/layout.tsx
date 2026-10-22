import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'RegalosParaTodos — Cajas de regalo para cada ocasión',
  description: 'Cajas de regalo temáticas con despacho a todo Chile. Tú eliges la categoría, nosotros armamos y enviamos directo al destinatario.',
  openGraph: {
    title: 'RegalosParaTodos',
    description: 'Cajas de regalo temáticas con despacho a todo Chile',
    locale: 'es_CL',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

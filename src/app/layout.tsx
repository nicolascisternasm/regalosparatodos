import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'RegalosParaTodos — Cajas de regalo para cada ocasión',
  description: 'Cajas de regalo temáticas con despacho a todo Chile. Tú eliges la categoría, nosotros armamos y enviamos directo al destinatario.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'RegalosParaTodos',
    description: 'Cajas de regalo temáticas con despacho a todo Chile',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: '/logo.jpg' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

import { NextResponse } from 'next/server'
import { getCajas } from '@/lib/catalogo'

export async function GET() {
  try {
    const cajas = await getCajas()
    return NextResponse.json({ cajas })
  } catch (error) {
    console.error('Error obteniendo catálogo:', error)
    return NextResponse.json({ error: 'Error al cargar catálogo' }, { status: 500 })
  }
}

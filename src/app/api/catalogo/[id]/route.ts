import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: caja, error } = await supabase
    .from('cajas')
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single()

  if (error || !caja) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  if (caja.tipo === 'variantes') {
    const { data: variantes } = await supabase
      .from('variantes')
      .select('*, imagenes:variantes_imagenes(*)')
      .eq('caja_id', id)
      .neq('estado', 'archivada')
      .order('orden', { ascending: true })

    return NextResponse.json({ caja, variantes: variantes ?? [] })
  }

  return NextResponse.json({ caja, variantes: [] })
}

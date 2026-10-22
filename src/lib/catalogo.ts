import { supabase } from './supabase'
import type { Caja } from '@/types'

export async function getCajas(): Promise<Caja[]> {
  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getCaja(id: string): Promise<Caja | null> {
  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single()

  if (error) return null
  return data
}

export async function getCajasByCategoria(categoria: string): Promise<Caja[]> {
  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .eq('activo', true)
    .eq('categoria', categoria)
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getCategorias(): Promise<string[]> {
  const { data, error } = await supabase
    .from('cajas')
    .select('categoria')
    .eq('activo', true)

  if (error) throw error
  const todas = (data ?? []).map((r) => r.categoria as string)
  return [...new Set(todas)]
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Caja, ItemCarrito } from '@/types'

const STORAGE_KEY = 'rpt_carrito'

function leerStorage(): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function guardarStorage(items: ItemCarrito[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function useCarrito() {
  const [items, setItems] = useState<ItemCarrito[]>([])

  useEffect(() => {
    setItems(leerStorage())
  }, [])

  const agregarItem = useCallback((caja: Caja) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.caja.id === caja.id)
      const nuevos = existe
        ? prev.map((i) => i.caja.id === caja.id ? { ...i, cantidad: i.cantidad + 1 } : i)
        : [...prev, { caja, cantidad: 1 }]
      guardarStorage(nuevos)
      return nuevos
    })
  }, [])

  const reducirItem = useCallback((cajaId: string) => {
    setItems((prev) => {
      const nuevos = prev
        .map((i) => i.caja.id === cajaId ? { ...i, cantidad: i.cantidad - 1 } : i)
        .filter((i) => i.cantidad > 0)
      guardarStorage(nuevos)
      return nuevos
    })
  }, [])

  const eliminarItem = useCallback((cajaId: string) => {
    setItems((prev) => {
      const nuevos = prev.filter((i) => i.caja.id !== cajaId)
      guardarStorage(nuevos)
      return nuevos
    })
  }, [])

  const vaciarCarrito = useCallback(() => {
    setItems([])
    guardarStorage([])
  }, [])

  const subtotal = items.reduce((acc, i) => acc + i.caja.precio * i.cantidad, 0)

  return { items, agregarItem, reducirItem, eliminarItem, vaciarCarrito, subtotal }
}

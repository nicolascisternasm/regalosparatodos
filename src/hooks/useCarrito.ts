'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Caja, ItemCarrito, Variante } from '@/types'

const STORAGE_KEY = 'rpt_carrito'

function itemKey(cajaId: string, varianteId?: string) {
  return `${cajaId}:${varianteId ?? ''}`
}

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

  const agregarItem = useCallback((caja: Caja, variante?: Variante) => {
    setItems((prev) => {
      const key = itemKey(caja.id, variante?.id)
      const existe = prev.find((i) => itemKey(i.caja.id, i.variante?.id) === key)
      const nuevos = existe
        ? prev.map((i) =>
            itemKey(i.caja.id, i.variante?.id) === key
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          )
        : [...prev, { caja, variante, cantidad: 1 }]
      guardarStorage(nuevos)
      return nuevos
    })
  }, [])

  const reducirItem = useCallback((cajaId: string, varianteId?: string) => {
    setItems((prev) => {
      const key = itemKey(cajaId, varianteId)
      const nuevos = prev
        .map((i) =>
          itemKey(i.caja.id, i.variante?.id) === key
            ? { ...i, cantidad: i.cantidad - 1 }
            : i
        )
        .filter((i) => i.cantidad > 0)
      guardarStorage(nuevos)
      return nuevos
    })
  }, [])

  const eliminarItem = useCallback((cajaId: string, varianteId?: string) => {
    setItems((prev) => {
      const key = itemKey(cajaId, varianteId)
      const nuevos = prev.filter((i) => itemKey(i.caja.id, i.variante?.id) !== key)
      guardarStorage(nuevos)
      return nuevos
    })
  }, [])

  const vaciarCarrito = useCallback(() => {
    setItems([])
    guardarStorage([])
  }, [])

  const subtotal = items.reduce(
    (acc, i) => acc + (i.variante?.precio ?? i.caja.precio) * i.cantidad,
    0
  )

  return { items, agregarItem, reducirItem, eliminarItem, vaciarCarrito, subtotal }
}

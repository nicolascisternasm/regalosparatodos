'use client'

import CajaFormulario from '../CajaFormulario'

export default function NuevaCajaPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2B0A1A', marginBottom: 24 }}>
        Nueva caja
      </h1>
      <CajaFormulario modo="nueva" />
    </div>
  )
}

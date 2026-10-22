// Lógica de fechas de despacho Starken desde Talagante
// Días de despacho: martes (2) y jueves (4)
// Horario de corte: 14:00
// Preparación mínima: 1 día hábil completo

const DIAS_DESPACHO = [2, 4] // martes y jueves

// Feriados Chile 2025-2026 (ampliar según necesidad)
const FERIADOS = new Set([
  '2025-01-01', '2025-04-18', '2025-04-19', '2025-05-01',
  '2025-05-21', '2025-06-20', '2025-07-16', '2025-08-15',
  '2025-09-18', '2025-09-19', '2025-10-31', '2025-11-01',
  '2025-12-08', '2025-12-25',
  '2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01',
  '2026-05-21', '2026-06-29', '2026-07-16', '2026-08-15',
  '2026-09-18', '2026-09-19', '2026-10-12', '2026-10-31',
  '2026-11-01', '2026-12-08', '2026-12-25',
])

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function esDiaHabil(d: Date): boolean {
  const dow = d.getDay()
  return dow !== 0 && dow !== 6 && !FERIADOS.has(toDateStr(d))
}

function agregarDiasHabiles(desde: Date, dias: number): Date {
  const result = new Date(desde)
  let agregados = 0
  while (agregados < dias) {
    result.setDate(result.getDate() + 1)
    if (esDiaHabil(result)) agregados++
  }
  return result
}

function proximoDiaDespacho(desde: Date): Date {
  const candidato = new Date(desde)
  // buscar el próximo martes o jueves
  for (let i = 1; i <= 14; i++) {
    candidato.setDate(candidato.getDate() + 1)
    if (DIAS_DESPACHO.includes(candidato.getDay()) && !FERIADOS.has(toDateStr(candidato))) {
      return candidato
    }
  }
  return candidato
}

export interface ResultadoFechaDespacho {
  fechaDespacho: Date       // día que sale de Talagante
  fechaDespachoStr: string  // formato legible
  diasHasta: number
  mensajeEstimado: string
}

export function calcularFechaDespacho(ahora?: Date): ResultadoFechaDespacho {
  const now = ahora ?? new Date()

  // Si pasó el horario de corte (14:00), el día de preparación empieza mañana
  const horaCorte = 14
  const pasoCorteDiario = now.getHours() >= horaCorte

  // Día desde el que cuenta la preparación
  let inicioPreparo = new Date(now)
  if (pasoCorteDiario) {
    inicioPreparo.setDate(inicioPreparo.getDate() + 1)
    // Asegurarse que ese día sea hábil
    while (!esDiaHabil(inicioPreparo)) {
      inicioPreparo.setDate(inicioPreparo.getDate() + 1)
    }
  } else if (!esDiaHabil(inicioPreparo)) {
    while (!esDiaHabil(inicioPreparo)) {
      inicioPreparo.setDate(inicioPreparo.getDate() + 1)
    }
  }

  // 1 día hábil completo de preparación mínima
  const finPreparacion = agregarDiasHabiles(inicioPreparo, 1)

  // Próximo martes o jueves después de la preparación
  const fechaDespacho = proximoDiaDespacho(finPreparacion)

  const diasHasta = Math.ceil(
    (fechaDespacho.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const fechaDespachoStr = fechaDespacho.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    fechaDespacho,
    fechaDespachoStr,
    diasHasta,
    mensajeEstimado: `Despacho estimado el ${fechaDespachoStr}`,
  }
}

export function recalcularFechaDespacho(aprobadoEn: string): ResultadoFechaDespacho {
  return calcularFechaDespacho(new Date(aprobadoEn))
}

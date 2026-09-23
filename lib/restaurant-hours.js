/**
 * Horario operativo del local (para plano de mesas por hora).
 * Alineado con el texto de site-info y el checkout.
 */
export const RESTAURANT_OPEN_TIME = "12:00";
export const RESTAURANT_CLOSE_TIME = "23:30";
export const FLOOR_PLAN_SLOT_MINUTES = 30;

export function timeToMinutes(timeText) {
  const [h, m] = String(timeText || "00:00")
    .slice(0, 5)
    .split(":")
    .map((part) => Number(part));
  const hours = Number.isFinite(h) ? h : 0;
  const mins = Number.isFinite(m) ? m : 0;
  return hours * 60 + mins;
}

export function minutesToTime(totalMinutes) {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Lista de horas del plano (p. ej. 12:00, 12:30 … 23:00). */
export function listOpenHourOptions({
  openTime = RESTAURANT_OPEN_TIME,
  closeTime = RESTAURANT_CLOSE_TIME,
  stepMinutes = FLOOR_PLAN_SLOT_MINUTES,
} = {}) {
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const step = Math.max(15, Number(stepMinutes) || 30);
  const options = [];
  for (let cursor = start; cursor < end; cursor += step) {
    options.push(minutesToTime(cursor));
  }
  return options;
}

/**
 * ¿La reserva cubre el instante `atTime`?
 * Intervalo [inicio, fin) en minutos del día.
 */
export function reservationCoversTime(startTime, endTime, atTime) {
  const start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);
  const at = timeToMinutes(atTime);
  // Si termina al día siguiente (raro), tratamos fin como +24h
  if (end <= start) {
    end += 24 * 60;
  }
  return at >= start && at < end;
}

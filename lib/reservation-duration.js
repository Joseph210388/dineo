/**
 * Duración de una reserva cuando el cliente no la define a mano.
 * Fórmula: clamp(personas × minutos_por_persona, min, max).
 */

export const DEFAULT_DURATION_SETTINGS = {
  minutesPerPerson: 45,
  minDurationMinutes: 60,
  maxDurationMinutes: 180,
  bufferMinutes: 15,
};

export function estimateDurationMinutes(people, settings = DEFAULT_DURATION_SETTINGS) {
  const count = Math.max(1, Number(people) || 1);
  const perPerson = Number(settings.minutesPerPerson) || DEFAULT_DURATION_SETTINGS.minutesPerPerson;
  const min = Number(settings.minDurationMinutes) || DEFAULT_DURATION_SETTINGS.minDurationMinutes;
  const max = Number(settings.maxDurationMinutes) || DEFAULT_DURATION_SETTINGS.maxDurationMinutes;
  const raw = count * perPerson;
  return Math.max(min, Math.min(max, raw));
}

export function formatDurationLabel(minutes) {
  const total = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours <= 0) return `${mins} min`;
  if (mins === 0) return hours === 1 ? "1 h" : `${hours} h`;
  return `${hours} h ${mins} min`;
}

/** Suma minutos a una hora HH:MM (puede pasar de medianoche). */
export function addMinutesToTime(timeText, minutes) {
  const [hoursRaw, minsRaw] = String(timeText || "00:00")
    .slice(0, 5)
    .split(":")
    .map((part) => Number(part));
  const hours = Number.isFinite(hoursRaw) ? hoursRaw : 0;
  const mins = Number.isFinite(minsRaw) ? minsRaw : 0;
  const total = hours * 60 + mins + Math.max(0, Number(minutes) || 0);
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHours = Math.floor(wrapped / 60);
  const nextMins = wrapped % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMins).padStart(2, "0")}`;
}

/** Franja visible para staff: inicio – fin (sin buffer). */
export function formatOccupationRange(startTime, durationMinutes) {
  const start = String(startTime || "").slice(0, 5);
  const end = addMinutesToTime(start, durationMinutes);
  return {
    start,
    end,
    label: start && end ? `${start} – ${end}` : start || "—",
  };
}

/** Intervalo [start, end) en ms para detectar solapes. */
export function reservationWindowMs(dateText, timeText, durationMinutes, bufferMinutes = 0) {
  const start = new Date(`${dateText}T${String(timeText).slice(0, 5)}:00`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  const end = new Date(
    start.getTime() + (Number(durationMinutes) + Number(bufferMinutes || 0)) * 60_000
  );
  return { startMs: start.getTime(), endMs: end.getTime() };
}

export function windowsOverlap(a, b) {
  if (!a || !b) return false;
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

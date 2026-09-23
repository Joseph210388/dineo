"use server";

import { sql } from "../db";
import {
  DEFAULT_DURATION_SETTINGS,
  estimateDurationMinutes,
  reservationWindowMs,
  windowsOverlap,
} from "../../lib/reservation-duration";

export async function getRestaurantDurationSettings() {
  const [row] = await sql`
    select minutes_per_person, min_duration_minutes, max_duration_minutes, buffer_minutes
    from restaurant_settings
    where id = 1
    limit 1
  `;

  if (!row) {
    return { ...DEFAULT_DURATION_SETTINGS };
  }

  return {
    minutesPerPerson: Number(row.minutes_per_person),
    minDurationMinutes: Number(row.min_duration_minutes),
    maxDurationMinutes: Number(row.max_duration_minutes),
    bufferMinutes: Number(row.buffer_minutes),
  };
}

export async function listVisibleTables() {
  const rows = await sql`
    select id, number, capacity, label, zone
    from restaurant_tables
    where is_active = true and deleted = false
    order by sort_order asc, number asc
  `;

  return rows.map((row) => ({
    id: String(row.id),
    number: Number(row.number),
    capacity: Number(row.capacity),
    label: row.label || `Mesa ${row.number}`,
    zone: row.zone || "salon",
  }));
}

/**
 * Mesas visibles + si caben en la franja (fecha/hora + duración estimada).
 */
export async function listTablesForSlot({
  date,
  time,
  people = 1,
  durationMinutes = null,
  excludeReservationId = null,
} = {}) {
  const settings = await getRestaurantDurationSettings();
  const duration =
    durationMinutes != null
      ? Number(durationMinutes)
      : estimateDurationMinutes(people, settings);
  const tables = await listVisibleTables();

  if (!date || !time) {
    return {
      settings,
      durationMinutes: duration,
      tables: tables.map((table) => ({
        ...table,
        available: true,
        fitsPeople: Number(people) <= table.capacity,
        reason: null,
      })),
    };
  }

  // -1 no coincide con ningún id real; evita SQL condicional frágil
  const excludeId = excludeReservationId ? Number(excludeReservationId) : -1;
  const candidates = await sql`
    select
      reservations.id,
      reservations.table_id,
      reservations.reservation_time,
      reservations.duration_minutes,
      reservations.number_of_people,
      reservations.status
    from reservations
    where reservations.reservation_date = ${date}
      and reservations.table_id is not null
      and reservations.status <> 'cancelled'
      and reservations.id <> ${excludeId}
  `;

  const requested = reservationWindowMs(date, time, duration, settings.bufferMinutes);

  const busyByTable = new Map();
  for (const row of candidates) {
    const tableKey = String(row.table_id);
    const existingDuration =
      row.duration_minutes != null
        ? Number(row.duration_minutes)
        : estimateDurationMinutes(row.number_of_people, settings);
    const window = reservationWindowMs(
      date,
      String(row.reservation_time).slice(0, 5),
      existingDuration,
      settings.bufferMinutes
    );
    if (!windowsOverlap(requested, window)) {
      continue;
    }
    const list = busyByTable.get(tableKey) || [];
    list.push(String(row.id));
    busyByTable.set(tableKey, list);
  }

  return {
    settings,
    durationMinutes: duration,
    tables: tables.map((table) => {
      const fitsPeople = Number(people) <= table.capacity;
      const clash = busyByTable.has(table.id);
      let reason = null;
      if (!fitsPeople) reason = "Capacidad insuficiente";
      else if (clash) reason = "Ocupada en esa franja";
      return {
        ...table,
        available: fitsPeople && !clash,
        fitsPeople,
        reason,
      };
    }),
  };
}

export async function assertTableAvailable({
  tableId,
  date,
  time,
  people,
  durationMinutes,
  excludeReservationId = null,
}) {
  const settings = await getRestaurantDurationSettings();
  const duration =
    durationMinutes != null
      ? Number(durationMinutes)
      : estimateDurationMinutes(people, settings);

  const [table] = await sql`
    select id, number, capacity, zone, deleted, is_active
    from restaurant_tables
    where id = ${Number(tableId)}
    limit 1
  `;

  if (!table || table.deleted || !table.is_active) {
    return { ok: false, message: "Esa mesa no está disponible", durationMinutes: duration };
  }
  if (Number(people) > Number(table.capacity)) {
    return {
      ok: false,
      message: `La mesa ${table.number} admite hasta ${table.capacity} personas`,
      durationMinutes: duration,
    };
  }

  const slot = await listTablesForSlot({
    date,
    time,
    people,
    durationMinutes: duration,
    excludeReservationId,
  });
  const found = slot.tables.find((item) => item.id === String(table.id));
  if (!found?.available) {
    return {
      ok: false,
      message: found?.reason || "Esa mesa choca con otra reserva",
      durationMinutes: duration,
    };
  }

  return {
    ok: true,
    table: {
      id: String(table.id),
      number: Number(table.number),
      capacity: Number(table.capacity),
      zone: table.zone,
    },
    durationMinutes: duration,
    settings,
  };
}

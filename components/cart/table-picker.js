"use client";

import { useEffect, useState } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { listTablesForSlot } from "../../backend/actions/tables";
import { formatDurationLabel } from "../../lib/reservation-duration";
import { tableTypeLabel } from "../../lib/reservation-preferences";

/**
 * Selector visual de mesas reales (capacidad + zona al hover).
 * Filtra ocupación según fecha/hora y duración estimada.
 */
export default function TablePicker({
  date,
  time,
  people = 1,
  value = "",
  onChange,
  onPeopleSuggest,
  excludeReservationId = null,
}) {
  const [tables, setTables] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listTablesForSlot({ date, time, people, excludeReservationId })
      .then((result) => {
        if (!alive) return;
        setTables(result.tables || []);
        setDurationMinutes(result.durationMinutes);
        setSettings(result.settings);
      })
      .catch(() => {
        if (!alive) return;
        setTables([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [date, time, people, excludeReservationId]);

  function selectTable(table) {
    if (!table.available) return;
    onChange?.(table.id, table);
    // Al elegir mesa, sugerimos personas = capacidad si aún no caben
    if (Number(people) > table.capacity) {
      onPeopleSuggest?.(table.capacity);
    }
  }

  const selected = tables.find((table) => table.id === value);

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-stone-800">Elige mesa</legend>
      <p className="mt-1 text-xs text-stone-500">
        {date && time
          ? `Duración estimada ${formatDurationLabel(durationMinutes || 0)} (${settings?.minutesPerPerson || 45} min/persona).`
          : "Selecciona fecha y hora para ver qué mesas están libres."}
      </p>

      {loading ? (
        <p className="mt-3 text-sm text-stone-500">Cargando mesas…</p>
      ) : tables.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-stone-300 bg-white px-3 py-6 text-center text-sm text-stone-500">
          No hay mesas visibles en el local.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {tables.map((table) => {
            const isSelected = value === table.id;
            const disabled = !table.available;
            const showTip = hoveredId === table.id;

            return (
              <div key={table.id} className="relative">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => selectTable(table)}
                  onMouseEnter={() => setHoveredId(table.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(table.id)}
                  onBlur={() => setHoveredId(null)}
                  className={`flex w-full flex-col items-center justify-center rounded-xl border-2 px-2 py-3 text-center transition ${
                    isSelected
                      ? "border-red-800 bg-red-50 shadow-sm"
                      : disabled
                        ? "cursor-not-allowed border-stone-200 bg-stone-100 opacity-55"
                        : "border-emerald-600/35 bg-emerald-50/80 hover:border-red-800/50 hover:bg-cream"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Mesa ${table.number}, ${table.capacity} personas, ${tableTypeLabel(table.zone)}`}
                >
                  <span className="text-xl font-bold tabular-nums text-stone-900">{table.number}</span>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 text-[0.7rem] font-semibold ${
                      isSelected ? "text-red-900" : disabled ? "text-stone-500" : "text-emerald-800"
                    }`}
                  >
                    <HiOutlineUserGroup className="h-3.5 w-3.5" />
                    {table.capacity}
                  </span>
                </button>

                {/* Tip al hover / focus: zona, capacidad y estado */}
                {showTip ? (
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-44 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-left text-xs shadow-lg shadow-stone-900/10">
                    <p className="font-semibold text-stone-900">Mesa {table.number}</p>
                    <p className="mt-0.5 text-stone-600">
                      Zona: {tableTypeLabel(table.zone)}
                    </p>
                    <p className="text-stone-600">Hasta {table.capacity} personas</p>
                    {table.reason ? (
                      <p className="mt-1 font-medium text-red-800">{table.reason}</p>
                    ) : (
                      <p className="mt-1 font-medium text-emerald-800">Libre en esa franja</p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {selected ? (
        <p className="mt-3 text-xs text-stone-600">
          Seleccionada: <span className="font-semibold text-stone-900">Mesa {selected.number}</span>
          {" · "}
          {tableTypeLabel(selected.zone)} · máx. {selected.capacity} pers.
        </p>
      ) : (
        <p className="mt-3 text-xs text-stone-500">Pasa el ratón (o enfoca) una mesa para ver el detalle.</p>
      )}
    </fieldset>
  );
}

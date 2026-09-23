"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import TablePicker from "../cart/table-picker";
import { updateStaffReservationDetailsAction } from "../../backend/actions/staff";
import { formatMoney } from "../../backend/staff-format";
import { formatDurationLabel } from "../../lib/reservation-duration";
import { allowsReservationDishEdit } from "../../lib/payment-methods";
import {
  DEFAULT_DIETARY,
  DEFAULT_TABLE_TYPE,
  DIETARY_OPTIONS,
  TABLE_TYPES,
} from "../../lib/reservation-preferences";

const fieldClass =
  "mt-1 w-full rounded-xl border border-stone-300/80 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15";

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

function buildInitialQuantities(items = []) {
  const next = {};
  for (const item of items) {
    if (item.dishId) {
      next[item.dishId] = Number(item.quantity) || 0;
    }
  }
  return next;
}

/**
 * Formulario staff: mesa/detalles siempre; platos solo si pago en local.
 */
export default function StaffReservationEditForm({ reservation, dishes = [] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const canEditDishes = allowsReservationDishEdit(reservation.paymentMethod);

  const [date, setDate] = useState(reservation.date || "");
  const [time, setTime] = useState(reservation.time || "");
  const [people, setPeople] = useState(Number(reservation.people) || 1);
  const [tableId, setTableId] = useState(reservation.tableId || "");
  const [tableType, setTableType] = useState(reservation.tableType || DEFAULT_TABLE_TYPE);
  const [dietaryNote, setDietaryNote] = useState(reservation.dietaryNote || DEFAULT_DIETARY);
  const [kitchenNote, setKitchenNote] = useState(reservation.kitchenNote || "");
  const [notes, setNotes] = useState(reservation.notes || "");
  const [status, setStatus] = useState(reservation.status || "confirmed");
  const [quantities, setQuantities] = useState(() => buildInitialQuantities(reservation.items));

  const foodTotal = useMemo(() => {
    return dishes.reduce((sum, dish) => {
      const qty = Number(quantities[dish.id] || 0);
      return sum + qty * Number(dish.price || 0);
    }, 0);
  }, [dishes, quantities]);

  const selectedFoodCount = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + Number(qty || 0), 0),
    [quantities]
  );

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);

    const data = new FormData();
    data.set("id", reservation.id);
    data.set("date", date);
    data.set("time", time);
    data.set("people", String(people));
    data.set("tableId", tableId || "");
    data.set("tableType", tableType);
    data.set("dietaryNote", dietaryNote);
    data.set("kitchenNote", kitchenNote);
    data.set("notes", notes);
    data.set("status", status);

    if (canEditDishes) {
      data.set("editDishes", "1");
      for (const dish of dishes) {
        data.set(`qty_${dish.id}`, String(Number(quantities[dish.id] || 0)));
      }
    }

    startTransition(async () => {
      const result = await updateStaffReservationDetailsAction(data);
      if (!result?.ok) {
        setError(result?.message || "No se pudo guardar");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Editar reserva</h2>
          <p className="text-xs text-stone-500">
            Mesa, horario y notas. El método de pago no se cambia.
            {reservation.durationMinutes
              ? ` · Duración: ${formatDurationLabel(reservation.durationMinutes)}`
              : null}
          </p>
        </div>
        {saved ? (
          <p className="text-xs font-medium text-emerald-700" role="status">
            Cambios guardados
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium text-stone-700">
          Fecha
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTableId("");
            }}
            required
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Hora
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setTableId("");
            }}
            required
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Personas
          <input
            type="number"
            min="1"
            value={people}
            onChange={(e) => {
              setPeople(Math.max(1, Number(e.target.value) || 1));
              setTableId("");
            }}
            required
            className={fieldClass}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3 sm:p-4">
        <TablePicker
          date={date}
          time={time}
          people={people}
          value={tableId}
          excludeReservationId={reservation.id}
          onChange={(id, table) => {
            setTableId(id);
            if (table?.zone && TABLE_TYPES.some((item) => item.id === table.zone)) {
              setTableType(table.zone);
            }
            if (table?.capacity && people > table.capacity) {
              setPeople(table.capacity);
            }
          }}
          onPeopleSuggest={(count) => setPeople(count)}
        />
        <button
          type="button"
          className="mt-2 text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
          onClick={() => setTableId("")}
        >
          Quitar mesa (solo zona)
        </button>
      </div>

      {!tableId ? (
        <label className="block text-sm font-medium text-stone-700">
          Zona preferida
          <select
            value={tableType}
            onChange={(e) => setTableType(e.target.value)}
            className={fieldClass}
          >
            {TABLE_TYPES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-stone-700">
          Dietética
          <select
            value={dietaryNote}
            onChange={(e) => setDietaryNote(e.target.value)}
            className={fieldClass}
          >
            {DIETARY_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Estado
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}>
            {STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-stone-700">
        Nota cocina
        <input
          value={kitchenNote}
          onChange={(e) => setKitchenNote(e.target.value)}
          maxLength={280}
          placeholder="Sin sal, diabetes…"
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-stone-700">
        Notas internas
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={fieldClass}
          placeholder="Observaciones del local…"
        />
      </label>

      {canEditDishes ? (
        <fieldset className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-3 sm:p-4">
          <legend className="px-1 text-sm font-semibold text-stone-900">Platos (pago en local)</legend>
          <p className="mb-3 text-xs text-stone-600">
            Puedes sustituir o sumar platos: el total se recalcula y se cobra al llegar.
          </p>
          {dishes.length === 0 ? (
            <p className="text-sm text-stone-500">No hay platos disponibles en la carta.</p>
          ) : (
            <ul className="thin-scrollbar max-h-64 divide-y divide-stone-200 overflow-y-auto rounded-xl border border-stone-200 bg-white sm:max-h-80">
              {dishes.map((dish) => (
                <li key={dish.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-800">{dish.name}</p>
                    <p className="text-xs text-stone-500">{formatMoney(dish.price)}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={quantities[dish.id] || 0}
                    onChange={(event) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [dish.id]: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                    className="w-16 shrink-0 rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-red-700"
                    aria-label={`Cantidad de ${dish.name}`}
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm text-stone-700">
            {selectedFoodCount} uds · nuevo total {formatMoney(foodTotal)}
          </p>
        </fieldset>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-3 py-3 text-sm text-amber-950">
          <p className="font-semibold">Platos bloqueados (tarjeta / Bizum)</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
            El importe ya quedó asociado a ese pago. Si el cliente se equivocó de plato, cancela esta
            reserva y crea otra (evita devoluciones o cobros parciales).
          </p>
        </div>
      )}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-[10rem]"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

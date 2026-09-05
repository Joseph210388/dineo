"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createStaffReservationAction } from "../../backend/actions/staff";
import PaymentMethodPicker from "../payment-method-picker/payment-method-picker";
import { DEFAULT_PAYMENT_METHOD } from "../../lib/payment-methods";

export default function StaffReservationForm({ customers, dishes }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await createStaffReservationAction(new FormData(event.currentTarget));
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push(`/staff/reservations/${result.id}`);
    router.refresh();
  }

  if (!customers.length) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-sm text-stone-500">
        Primero hace falta un cliente registrado. El personal no puede reservar a su propio nombre.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"
    >
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <label className="block text-sm font-medium text-stone-700">
        Cliente
        <select
          name="customerId"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15"
        >
          <option value="">Elige un cliente</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} · {customer.email}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium text-stone-700">
          Fecha
          <input
            type="date"
            name="date"
            required
            min={today}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Hora
          <input
            type="time"
            name="time"
            required
            min="12:00"
            max="23:59"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Personas
          <input
            type="number"
            name="people"
            required
            min="1"
            defaultValue="2"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15"
          />
        </label>
      </div>

      <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

      <label className="block text-sm font-medium text-stone-700">
        Notas
        <textarea
          name="notes"
          rows={2}
          placeholder="Alergias, mesa junto a la ventana…"
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15"
        />
      </label>

      {dishes.length ? (
        <fieldset>
          <legend className="text-sm font-medium text-stone-700">Platos (opcional)</legend>
          <ul className="mt-2 divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
            {dishes.map((dish) => (
              <li key={dish.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0 truncate text-sm text-stone-700">{dish.name}</span>
                <input
                  type="number"
                  name={`qty_${dish.id}`}
                  min="0"
                  defaultValue="0"
                  className="w-16 shrink-0 rounded-lg border border-stone-200 px-2 py-1 text-sm outline-none focus:border-red-700"
                  aria-label={`Cantidad de ${dish.name}`}
                />
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Guardando..." : "Crear reserva"}
      </button>
    </form>
  );
}

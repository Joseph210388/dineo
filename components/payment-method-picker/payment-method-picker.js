"use client";

import { PAYMENT_METHODS } from "../../lib/payment-methods";

export default function PaymentMethodPicker({
  value,
  onChange,
  name = "paymentMethod",
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-stone-800">Forma de pago</legend>
      <p className="mt-1 text-xs text-stone-500">
        Por defecto se paga en el local. Tarjeta y Bizum se ven para la demo; no cobran de verdad.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = value === method.id;

          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 ${
                isSelected ? "border-red-700 bg-red-50" : "border-stone-200 bg-white"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={method.id}
                checked={isSelected}
                onChange={() => onChange(method.id)}
                className="mt-1 accent-red-800"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-stone-800">{method.label}</span>
                  {method.isDemo ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-800">
                      Demo
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs text-stone-500">{method.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

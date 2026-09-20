"use client";

import { HiOutlineCash, HiOutlineCreditCard, HiOutlineDeviceMobile } from "react-icons/hi";
import { PAYMENT_METHODS } from "../../lib/payment-methods";

const METHOD_ICONS = {
  local: HiOutlineCash,
  card: HiOutlineCreditCard,
  bizum: HiOutlineDeviceMobile,
};

export default function PaymentMethodPicker({
  value,
  onChange,
  name = "paymentMethod",
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-stone-800">Forma de pago</legend>
      <p className="mt-1 text-xs text-stone-500">
        En el local pagas al llegar. Tarjeta y Bizum abren un pago demo (no cobran de verdad).
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-2.5">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = value === method.id;
          const Icon = METHOD_ICONS[method.id] || HiOutlineCash;

          return (
            <label
              key={method.id}
              className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border px-1.5 py-2 transition sm:px-2 ${
                isSelected
                  ? "border-red-700 bg-red-50 shadow-sm shadow-red-900/10"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <span
                className={`absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border sm:left-2 sm:top-2 sm:h-[1.125rem] sm:w-[1.125rem] ${
                  isSelected ? "border-red-800 bg-red-800" : "border-stone-300 bg-white"
                }`}
                aria-hidden
              >
                {isSelected ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                ) : null}
              </span>

              <input
                type="radio"
                name={name}
                value={method.id}
                checked={isSelected}
                onChange={() => onChange(method.id)}
                className="sr-only"
              />

              <Icon
                className={`h-7 w-7 sm:h-8 sm:w-8 ${isSelected ? "text-red-800" : "text-stone-500"}`}
                aria-hidden
              />
              <span
                className={`mt-1.5 text-center text-[0.65rem] font-semibold leading-tight sm:mt-2 sm:text-xs ${
                  isSelected ? "text-red-900" : "text-stone-700"
                }`}
              >
                {method.label}
              </span>
              {method.isDemo ? (
                <span className="mt-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-amber-800">
                  Demo
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

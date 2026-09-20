"use client";

/**
 * Indicador de los 3 pasos del checkout de reserva.
 */
export default function CheckoutStepper({ step = 1 }) {
  const steps = [
    { id: 1, label: "Datos" },
    { id: 2, label: "Pago" },
    { id: 3, label: "Listo" },
  ];

  return (
    <ol className="mb-5 flex items-center gap-1 sm:gap-2" aria-label="Pasos de la reserva">
      {steps.map((item, index) => {
        const active = step === item.id;
        const done = step > item.id;
        return (
          <li key={item.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <div
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 ${
                active ? "text-red-900" : done ? "text-red-800" : "text-stone-400"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 ${
                  active || done
                    ? "bg-red-800 text-white"
                    : "border border-stone-300 bg-white text-stone-500"
                }`}
              >
                {item.id}
              </span>
              <span className="truncate text-[0.65rem] font-semibold uppercase tracking-wide sm:text-xs">
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span
                className={`mb-4 h-px w-full max-w-[2rem] shrink-0 sm:max-w-[3rem] ${
                  done ? "bg-red-800" : "bg-stone-200"
                }`}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { formatMoney } from "../../backend/staff-format";
import PaymentMethodPicker from "./payment-method-picker";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-red-700 focus:ring-4 focus:ring-red-700/15";

/** Altura fija del panel para que el slide no estire ni encoja el resumen */
const PANEL_HEIGHT =
  "h-[min(28rem,70svh)] sm:h-[26rem]";

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isCardExpiryValid(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(String(value || "").trim());
  if (!match) {
    return false;
  }
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) {
    return false;
  }
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  return true;
}

function isCardFormValid({ holder, number, cvc, expiry }) {
  const digits = onlyDigits(number);
  const cvcDigits = onlyDigits(cvc);
  return (
    String(holder || "").trim().length >= 3 &&
    digits.length === 16 &&
    (cvcDigits.length === 3 || cvcDigits.length === 4) &&
    isCardExpiryValid(expiry)
  );
}

function isBizumPhoneValid(value) {
  return onlyDigits(value).length === 9;
}

/**
 * 1) Elige método → Continuar
 * 2) Local: reserva al momento
 * 3) Tarjeta/Bizum: slide al formulario; el pago solo si está completo
 * Altura fija para no saltar el layout del carrito.
 */
export default function PaymentCheckout({
  value,
  onChange,
  totalPrice = 0,
  canSubmit = false,
  isSubmitting = false,
  onLocalPay,
  onDemoPay,
  onBack,
}) {
  const [step, setStep] = useState("methods");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [bizumPhone, setBizumPhone] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  const cardReady = useMemo(
    () =>
      isCardFormValid({
        holder: cardHolder,
        number: cardNumber,
        cvc: cardCvc,
        expiry: cardExpiry,
      }),
    [cardHolder, cardNumber, cardCvc, cardExpiry]
  );
  const bizumReady = useMemo(() => isBizumPhoneValid(bizumPhone), [bizumPhone]);
  const busy = isSubmitting || demoBusy;
  const payLabel = `Pagar ${formatMoney(totalPrice)}`;

  useEffect(() => {
    if (!demoBusy) {
      setDemoProgress(0);
      return undefined;
    }

    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      setDemoProgress(Math.min(100, Math.round((elapsed / 5000) * 100)));
    }, 100);

    return () => window.clearInterval(timer);
  }, [demoBusy]);

  function handleMethodChange(next) {
    onChange(next);
    // Solo selección: el slide ocurre al pulsar Continuar
    setStep("methods");
  }

  function goBackToMethods() {
    if (busy) {
      return;
    }
    setStep("methods");
  }

  async function handleContinue() {
    if (!canSubmit || busy) {
      return;
    }

    if (value === "local") {
      await onLocalPay?.();
      return;
    }

    // Tarjeta o Bizum: pasa al formulario demo sin cobrar aún
    setStep("details");
  }

  async function handleCardPay() {
    if (!canSubmit || !cardReady || busy) {
      return;
    }
    await onDemoPay?.();
  }

  async function handleBizumPay() {
    if (!canSubmit || !bizumReady || busy) {
      return;
    }

    setDemoBusy(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 5000));
      await onDemoPay?.();
    } finally {
      setDemoBusy(false);
    }
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-50/60 ${PANEL_HEIGHT}`}>
      <div
        className={`flex h-full w-[200%] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          step === "details" ? "-translate-x-1/2" : "translate-x-0"
        }`}
      >
        {/* Paso 1: elegir método + Continuar */}
        <div className="flex h-full w-1/2 shrink-0 flex-col p-3 sm:p-4">
          <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar pr-0.5">
            <PaymentMethodPicker value={value} onChange={handleMethodChange} />
            <p className="mt-3 text-xs text-stone-500">
              {value === "local"
                ? "Al continuar se confirma la reserva. Pagarás en el local."
                : "Al continuar verás el formulario de pago demo. No se cobra de verdad."}
            </p>
            {!canSubmit ? (
              <p className="mt-2 text-xs text-red-800/90">
                Completa fecha, hora, personas y contacto antes de continuar.
              </p>
            ) : null}
          </div>
          <div className="mt-3 flex shrink-0 flex-col gap-2">
            {onBack ? (
              <button
                type="button"
                disabled={busy}
                onClick={onBack}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Volver a datos
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canSubmit || busy}
              onClick={handleContinue}
              className="w-full rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              {busy && value === "local" ? "Reservando…" : "Continuar"}
            </button>
          </div>
        </div>

        {/* Paso 2: formulario tarjeta / Bizum (misma altura) */}
        <div className="flex h-full w-1/2 shrink-0 flex-col p-3 sm:p-4">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={goBackToMethods}
              disabled={busy}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
              aria-label="Volver a formas de pago"
            >
              <HiOutlineArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900">
                {value === "bizum" ? "Pago con Bizum" : "Pago con tarjeta"}
              </p>
              <p className="text-xs text-amber-800">Demo · no se cobra de verdad</p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar pr-0.5">
            {value === "card" ? (
              <div className="space-y-2.5">
                <label className="block text-sm font-medium text-stone-700">
                  Nombre en la tarjeta
                  <input
                    className={fieldClass}
                    value={cardHolder}
                    onChange={(event) => setCardHolder(event.target.value)}
                    placeholder="Como aparece en la tarjeta"
                    autoComplete="cc-name"
                    disabled={busy}
                  />
                </label>
                <label className="block text-sm font-medium text-stone-700">
                  Número de tarjeta
                  <input
                    className={fieldClass}
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                    placeholder="ACCT-000003"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    disabled={busy}
                  />
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block text-sm font-medium text-stone-700">
                    Caducidad
                    <input
                      className={fieldClass}
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(formatExpiry(event.target.value))}
                      placeholder="MM/AA"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      disabled={busy}
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-700">
                    CVC
                    <input
                      className={fieldClass}
                      value={cardCvc}
                      onChange={(event) => setCardCvc(onlyDigits(event.target.value).slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      disabled={busy}
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {value === "bizum" ? (
              <div className="space-y-2.5">
                <label className="block text-sm font-medium text-stone-700">
                  Número de teléfono
                  <input
                    className={fieldClass}
                    value={bizumPhone}
                    onChange={(event) => setBizumPhone(onlyDigits(event.target.value).slice(0, 9))}
                    placeholder="600123456"
                    inputMode="tel"
                    autoComplete="tel"
                    disabled={busy}
                  />
                </label>
                <p className="text-xs text-stone-500">
                  En la demo simulamos la confirmación de Bizum durante unos segundos.
                </p>
                {demoBusy ? (
                  <div className="space-y-1.5">
                    <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-red-800 transition-[width] duration-100 ease-linear"
                        style={{ width: `${demoProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-xs font-medium text-stone-600">
                      Confirmando Bizum… {demoProgress}%
                    </p>
                  </div>
                ) : (
                  // Reserva espacio de la barra para no saltar al empezar la carga
                  <div className="h-[2.75rem]" aria-hidden />
                )}
              </div>
            ) : null}

            {value === "local" ? (
              <p className="text-sm text-stone-500">
                Has vuelto atrás. Elige otra forma de pago o continúa con pago en el local.
              </p>
            ) : null}
          </div>

          {value === "card" ? (
            <button
              type="button"
              disabled={!canSubmit || !cardReady || busy}
              onClick={handleCardPay}
              className="mt-3 w-full shrink-0 rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              {busy ? "Procesando…" : payLabel}
            </button>
          ) : null}

          {value === "bizum" ? (
            <button
              type="button"
              disabled={!canSubmit || !bizumReady || busy}
              onClick={handleBizumPay}
              className="mt-3 w-full shrink-0 rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              {demoBusy ? "Esperando Bizum…" : busy ? "Reservando…" : payLabel}
            </button>
          ) : null}

          {value === "local" ? (
            <button
              type="button"
              onClick={goBackToMethods}
              className="mt-3 w-full shrink-0 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 sm:text-base"
            >
              Volver
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const PAYMENT_METHODS = [
  {
    id: "local",
    label: "Pago en el local",
    hint: "Pagas al llegar. Disponible ahora.",
    isDemo: false,
  },
  {
    id: "card",
    label: "Tarjeta",
    hint: "Demo: aún no cobra. Falta la aprobación del banco.",
    isDemo: true,
  },
  {
    id: "bizum",
    label: "Bizum",
    hint: "Demo: aún no cobra. Falta la aprobación del banco.",
    isDemo: true,
  },
];

export const DEFAULT_PAYMENT_METHOD = "local";

export function isPaymentMethod(value) {
  return PAYMENT_METHODS.some((method) => method.id === value);
}

export function paymentMethodLabel(value) {
  return PAYMENT_METHODS.find((method) => method.id === value)?.label || "Pago en el local";
}

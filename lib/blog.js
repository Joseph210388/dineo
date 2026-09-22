/** Tipos de entrada del blog del local. */
export const POST_KINDS = [
  { value: "news", label: "Noticia" },
  { value: "promo", label: "Promoción" },
  { value: "dish", label: "Plato destacado" },
  { value: "event", label: "Evento" },
];

export const POST_STATUSES = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
];

export function postKindLabel(kind) {
  return POST_KINDS.find((item) => item.value === kind)?.label || "Noticia";
}

export function postStatusLabel(status) {
  return POST_STATUSES.find((item) => item.value === status)?.label || status;
}

export function isPostKind(value) {
  return POST_KINDS.some((item) => item.value === value);
}

export function isPostStatus(value) {
  return POST_STATUSES.some((item) => item.value === value);
}

/** Preferencias de mesa y dietética (opciones rápidas + nota libre). */

export const TABLE_TYPES = [
  {
    id: "salon",
    label: "Salón",
    hint: "Luz cálida, zona tranquila",
  },
  {
    id: "ventana",
    label: "Ventana",
    hint: "Más luz natural",
  },
  {
    id: "reservada",
    label: "Reservada",
    hint: "Más íntima",
  },
  {
    id: "barra",
    label: "Barra",
    hint: "Ágil e informal",
  },
];

export const DIETARY_OPTIONS = [
  { id: "none", label: "Ninguna", hint: "Sin alergias" },
  { id: "gluten", label: "Sin gluten", hint: "Adaptamos si podemos" },
  { id: "lactosa", label: "Sin lactosa", hint: "Salsas y postres" },
  { id: "marisco", label: "Sin marisco", hint: "Incluye crustáceos" },
  { id: "frutos_secos", label: "Sin frutos secos", hint: "Evitamos trazas" },
];

export const DEFAULT_TABLE_TYPE = "salon";
export const DEFAULT_DIETARY = "none";

export function isTableType(value) {
  return TABLE_TYPES.some((item) => item.id === value);
}

export function isDietaryOption(value) {
  return DIETARY_OPTIONS.some((item) => item.id === value);
}

export function tableTypeLabel(value) {
  return TABLE_TYPES.find((item) => item.id === value)?.label || "Salón";
}

export function tableTypeDescription(value) {
  return TABLE_TYPES.find((item) => item.id === value)?.hint || "";
}

export function dietaryLabel(value) {
  // Compatibilidad con reservas antiguas con "otra"
  if (value === "otra") {
    return "Otra indicación";
  }
  return DIETARY_OPTIONS.find((item) => item.id === value)?.label || "Ninguna";
}

export function dietaryDescription(value) {
  if (value === "otra") {
    return "Ver nota para cocina";
  }
  return DIETARY_OPTIONS.find((item) => item.id === value)?.hint || "";
}

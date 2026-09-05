export const MENU_PAGE_SIZE = 8;
export const TABLE_PAGE_SIZE = 10;
export const STAFF_RESERVATIONS_FETCH_LIMIT = 80;

export function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(text, query) {
  const needle = normalizeSearch(query).trim();
  if (!needle) {
    return true;
  }
  return normalizeSearch(text).includes(needle);
}

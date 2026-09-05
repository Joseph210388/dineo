export const FAVORITES_CHANGED_EVENT = "taipei-favorites-changed";

export function favoritesKey(userId) {
  return `taipei_favorites_${userId}`;
}

// La lista de /favorites se actualiza al momento, sin recargar la página
function notifyFavoritesChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  }
}

export function readFavorites(userId) {
  if (!userId) {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(favoritesKey(userId)) || "[]");
  } catch {
    return [];
  }
}

export function writeFavorites(userId, ids) {
  try {
    localStorage.setItem(favoritesKey(userId), JSON.stringify(ids));
    notifyFavoritesChanged();
  } catch {
    throw new Error("No se pudieron guardar los favoritos");
  }
}

export function toggleFavoriteId(userId, dishId) {
  const current = readFavorites(userId);
  const id = String(dishId);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  writeFavorites(userId, next);
  return next;
}

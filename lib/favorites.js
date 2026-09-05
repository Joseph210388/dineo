export function favoritesKey(userId) {
  return `taipei_favorites_${userId}`;
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
  localStorage.setItem(favoritesKey(userId), JSON.stringify(ids));
}

export function toggleFavoriteId(userId, dishId) {
  const current = readFavorites(userId);
  const id = String(dishId);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  writeFavorites(userId, next);
  return next;
}

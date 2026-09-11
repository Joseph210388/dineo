/**
 * Sugiere otros platos según la categoría del actual.
 * Primero la misma categoría; luego categorías que suelen pedirse juntas.
 */

function normalizeCategory(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const COMPLEMENTS = {
  entradas: ["principales", "bebidas"],
  entrantes: ["principales", "bebidas"],
  principales: ["postres", "bebidas", "entradas", "entrantes"],
  postres: ["bebidas"],
  bebidas: ["entradas", "entrantes", "principales"],
};

function toSuggestion(dish) {
  return {
    id: String(dish.id ?? dish._id),
    name: dish.name,
    image: dish.image || dish.image_url,
    price: Number(dish.price),
    category: dish.category,
  };
}

export function suggestDishesFor(dish, allDishes, limit = 3) {
  if (!dish || !allDishes?.length) {
    return [];
  }

  const currentId = String(dish.id ?? dish._id);
  const currentCategory = normalizeCategory(dish.category);
  const others = allDishes.filter((item) => String(item.id ?? item._id) !== currentId);

  const sameCategory = others.filter(
    (item) => normalizeCategory(item.category) === currentCategory
  );

  const complementKeys = COMPLEMENTS[currentCategory] || [];
  const complementary = others.filter((item) =>
    complementKeys.includes(normalizeCategory(item.category))
  );

  const picked = [];
  const seen = new Set();

  function take(list, max) {
    for (const item of list) {
      if (picked.length >= max) {
        break;
      }
      const id = String(item.id ?? item._id);
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      picked.push(toSuggestion(item));
    }
  }

  // Hasta 2 de la misma categoría; el resto de categorías complementarias
  take(sameCategory, Math.min(2, limit));
  take(complementary, limit);
  // Si aún faltan, cualquier otro disponible
  take(others, limit);

  return picked.slice(0, limit);
}

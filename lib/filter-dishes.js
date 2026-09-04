export const DISH_TYPES = [
  { id: "mar", label: "Del mar" },
  { id: "criollo", label: "Criollo" },
  { id: "andino", label: "Andino" },
  { id: "dulce", label: "Dulce final" },
  { id: "casa", label: "De la casa" },
];

export const PRICE_ORDERS = [
  { id: "menu", label: "Como en la carta" },
  { id: "cheap", label: "Más barato primero" },
  { id: "expensive", label: "Más caro primero" },
];

const TYPE_KEYWORDS = {
  mar: ["ceviche", "pescado", "marisco", "tiradito", "leche de tigre", "conchas", "jalea", "chita"],
  criollo: ["lomo", "causa", "aji", "anticucho", "arroz", "papa", "saltado", "aji de gallina", "tallarin"],
  andino: ["quinoa", "cuy", "pachamanca", "ocopa", "rocoto", "chuño", "humita"],
  dulce: ["suspiro", "mazamorra", "alfajor", "postre", "helado", "torta", "picarones", "arroz con leche"],
};

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function dishText(dish) {
  return normalize(
    [
      dish.name,
      dish.description,
      dish.category,
      dish.recommendation,
      ...(dish.ingredients || []),
      ...(dish.allergens || []),
    ].join(" ")
  );
}

function categoryLooksLikeDessert(category) {
  const value = normalize(category);
  return value.includes("postre") || value.includes("dulce");
}

export function toggleSelection(values, id) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

export function getDishCategories(dishes) {
  return [...new Set(dishes.map((dish) => dish.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

export function matchesDishType(dish, typeId) {
  if (!typeId) {
    return true;
  }

  if (typeId === "casa") {
    return Boolean(dish.recommendation);
  }

  if (typeId === "dulce" && categoryLooksLikeDessert(dish.category)) {
    return true;
  }

  const haystack = dishText(dish);
  return (TYPE_KEYWORDS[typeId] || []).some((keyword) => haystack.includes(normalize(keyword)));
}

export function filterAndSortDishes(dishes, { query, categories = [], types = [], order }) {
  const needle = normalize(query).trim();

  const filtered = dishes.filter((dish) => {
    const matchesQuery = !needle || dishText(dish).includes(needle);
    const matchesCategory = !categories.length || categories.includes(dish.category);
    const matchesType = !types.length || types.some((typeId) => matchesDishType(dish, typeId));
    return matchesQuery && matchesCategory && matchesType;
  });

  const sorted = [...filtered];

  if (order === "cheap") {
    sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "es"));
  } else if (order === "expensive") {
    sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, "es"));
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  return sorted;
}

export function countByCategory(dishes, category) {
  return dishes.filter((dish) => dish.category === category).length;
}

export function countByType(dishes, typeId) {
  return dishes.filter((dish) => matchesDishType(dish, typeId)).length;
}

export function getActiveFilterTags({ query, categories = [], types = [], order }) {
  const tags = [];

  if (query.trim()) {
    tags.push({ id: "query", group: "query", label: `“${query.trim()}”` });
  }

  categories.forEach((category) => {
    tags.push({ id: `category:${category}`, group: "category", value: category, label: category });
  });

  types.forEach((typeId) => {
    const found = DISH_TYPES.find((item) => item.id === typeId);
    tags.push({
      id: `type:${typeId}`,
      group: "type",
      value: typeId,
      label: found?.label || typeId,
    });
  });

  if (order && order !== "menu") {
    const found = PRICE_ORDERS.find((item) => item.id === order);
    tags.push({
      id: `order:${order}`,
      group: "order",
      value: order,
      label: found?.label || order,
    });
  }

  return tags;
}

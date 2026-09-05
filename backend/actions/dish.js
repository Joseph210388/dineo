"use server";

import { sql } from "../db";
import { loadDishRelations, relationsForDish } from "../dish-relations";

function mapDish(row, extras = {}) {
  const photos = [row.image_url, ...(extras.images || [])].filter(Boolean);
  const uniquePhotos = [...new Set(photos)];

  return {
    _id: String(row.id),
    id: String(row.id),
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image_url,
    images: uniquePhotos,
    category: row.category,
    stock: row.stock,
    recommendation: row.recommendation || "",
    ingredients: extras.ingredients || [],
    allergens: extras.allergens || [],
  };
}

export async function getAllDish() {
  const dishes = await sql`
    select id, name, description, price, image_url, category, stock, recommendation
    from dishes
    where is_available = true
    order by name
  `;

  const extras = await loadDishRelations(dishes.map((dish) => dish.id));

  return dishes.map((dish) => {
    const mapped = mapDish(dish, relationsForDish(dish.id, extras));
    mapped.suggestions = dishes
      .filter((other) => other.id !== dish.id && other.category === dish.category)
      .slice(0, 3)
      .map((other) => ({
        id: String(other.id),
        name: other.name,
        image: other.image_url,
        price: Number(other.price),
        category: other.category,
      }));
    return mapped;
  });
}

export async function getDishById(id) {
  const [dish] = await sql`
    select id, name, description, price, image_url, category, stock, recommendation
    from dishes
    where id = ${id}
    limit 1
  `;

  if (!dish) {
    return null;
  }

  const extras = await loadDishRelations([dish.id]);
  const mapped = mapDish(dish, relationsForDish(dish.id, extras));

  const similar = await sql`
    select id, name, image_url, price, category
    from dishes
    where is_available = true and id <> ${dish.id} and category = ${dish.category}
    order by name
    limit 3
  `;

  mapped.suggestions = similar.map((other) => ({
    id: String(other.id),
    name: other.name,
    image: other.image_url,
    price: Number(other.price),
    category: other.category,
  }));

  return mapped;
}

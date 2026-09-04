"use server";

import { sql } from "../db";

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

async function loadDishExtras(dishIds) {
  if (!dishIds.length) {
    return { ingredients: [], allergens: [], images: [] };
  }

  const [ingredients, allergens, images] = await Promise.all([
    sql`select dish_id, name from dish_ingredients where dish_id in ${sql(dishIds)} order by name`,
    sql`select dish_id, name from dish_allergens where dish_id in ${sql(dishIds)} order by name`,
    sql`select dish_id, image_url from dish_images where dish_id in ${sql(dishIds)} order by sort_order, id`,
  ]);

  return { ingredients, allergens, images };
}

function extrasForDish(id, extras) {
  const dishId = Number(id);
  return {
    ingredients: extras.ingredients.filter((row) => Number(row.dish_id) === dishId).map((row) => row.name),
    allergens: extras.allergens.filter((row) => Number(row.dish_id) === dishId).map((row) => row.name),
    images: extras.images.filter((row) => Number(row.dish_id) === dishId).map((row) => row.image_url),
  };
}

export async function getAllDish() {
  const dishes = await sql`
    select id, name, description, price, image_url, category, stock, recommendation
    from dishes
    where is_available = true
    order by name
  `;

  const extras = await loadDishExtras(dishes.map((dish) => dish.id));

  return dishes.map((dish) => {
    const mapped = mapDish(dish, extrasForDish(dish.id, extras));
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

  const extras = await loadDishExtras([dish.id]);
  const mapped = mapDish(dish, extrasForDish(dish.id, extras));

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

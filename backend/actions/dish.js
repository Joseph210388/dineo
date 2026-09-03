"use server";

import { sql } from "../db";

function mapDish(row, ingredients = []) {
  return {
    _id: String(row.id),
    id: String(row.id),
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image_url,
    category: row.category,
    stock: row.stock,
    ingredients,
  };
}

export async function getAllDish() {
  const dishes = await sql`
    select id, name, description, price, image_url, category, stock
    from dishes
    where is_available = true
    order by name
  `;

  return dishes.map((dish) => mapDish(dish));
}

export async function getDishById(id) {
  const [dish] = await sql`
    select id, name, description, price, image_url, category, stock
    from dishes
    where id = ${id}
    limit 1
  `;

  if (!dish) {
    return null;
  }

  const ingredients = await sql`
    select name from dish_ingredients where dish_id = ${id} order by name
  `;

  return mapDish(dish, ingredients.map((item) => item.name));
}

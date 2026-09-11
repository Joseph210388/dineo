"use server";

import { sql } from "../db";
import { loadDishRelations, relationsForDish } from "../dish-relations";
import { suggestDishesFor } from "../../lib/suggest-dishes";

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
    ingredients: extras.ingredients || [],
    allergens: extras.allergens || [],
  };
}

async function loadAllDishes() {
  const dishes = await sql`
    select id, name, description, price, image_url, category, stock
    from dishes
    where is_available = true
    order by name
  `;

  const extras = await loadDishRelations(dishes.map((dish) => dish.id));

  const mapped = dishes.map((dish) => mapDish(dish, relationsForDish(dish.id, extras)));

  return mapped.map((dish) => ({
    ...dish,
    suggestions: suggestDishesFor(dish, mapped, 3),
  }));
}

function isProductionBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export async function getAllDish() {
  // El build de Vercel no debe abrir Postgres (IPv6 ENETUNREACH)
  if (isProductionBuild()) {
    return [];
  }

  return loadAllDishes();
}

export async function getDishById(id) {
  if (isProductionBuild()) {
    return null;
  }
  const [dish] = await sql`
    select id, name, description, price, image_url, category, stock
    from dishes
    where id = ${id}
    limit 1
  `;

  if (!dish) {
    return null;
  }

  const extras = await loadDishRelations([dish.id]);
  const mapped = mapDish(dish, relationsForDish(dish.id, extras));

  const others = await sql`
    select id, name, image_url, price, category
    from dishes
    where is_available = true and id <> ${dish.id}
    order by name
  `;

  mapped.suggestions = suggestDishesFor(
    mapped,
    others.map((row) => ({
      id: row.id,
      name: row.name,
      image: row.image_url,
      price: row.price,
      category: row.category,
    })),
    3
  );

  return mapped;
}

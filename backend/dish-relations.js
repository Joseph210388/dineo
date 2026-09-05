import { sql } from "./db";

export async function listCatalogIngredients() {
  return sql`select id, name from ingredients order by name`;
}

export async function listCatalogAllergens() {
  return sql`select id, name from allergens order by name`;
}

export async function loadDishRelations(dishIds) {
  if (!dishIds.length) {
    return { ingredients: [], allergens: [], images: [] };
  }

  const ingredients = await sql`
      select links.dish_id, ingredients.id, ingredients.name
      from dish_ingredient_links as links
      inner join ingredients on ingredients.id = links.ingredient_id
      where links.dish_id in ${sql(dishIds)}
      order by ingredients.name
    `;
  const allergens = await sql`
      select links.dish_id, allergens.id, allergens.name
      from dish_allergen_links as links
      inner join allergens on allergens.id = links.allergen_id
      where links.dish_id in ${sql(dishIds)}
      order by allergens.name
    `;
  const images = await sql`
      select dish_id, image_url
      from dish_images
      where dish_id in ${sql(dishIds)}
      order by sort_order, id
    `;

  return { ingredients, allergens, images };
}

export function relationsForDish(id, extras) {
  const dishId = Number(id);
  return {
    ingredients: extras.ingredients.filter((row) => Number(row.dish_id) === dishId).map((row) => row.name),
    allergens: extras.allergens.filter((row) => Number(row.dish_id) === dishId).map((row) => row.name),
    ingredientIds: extras.ingredients.filter((row) => Number(row.dish_id) === dishId).map((row) => String(row.id)),
    allergenIds: extras.allergens.filter((row) => Number(row.dish_id) === dishId).map((row) => String(row.id)),
    images: extras.images.filter((row) => Number(row.dish_id) === dishId).map((row) => row.image_url),
  };
}

export async function replaceDishRelations(dishId, ingredientIds, allergenIds, extraImages) {
  await sql`delete from dish_ingredient_links where dish_id = ${dishId}`;
  for (const ingredientId of ingredientIds) {
    await sql`
      insert into dish_ingredient_links (dish_id, ingredient_id)
      values (${dishId}, ${ingredientId})
    `;
  }

  await sql`delete from dish_allergen_links where dish_id = ${dishId}`;
  for (const allergenId of allergenIds) {
    await sql`
      insert into dish_allergen_links (dish_id, allergen_id)
      values (${dishId}, ${allergenId})
    `;
  }

  await sql`delete from dish_images where dish_id = ${dishId}`;
  for (const [index, imageUrl] of extraImages.entries()) {
    await sql`
      insert into dish_images (dish_id, image_url, sort_order)
      values (${dishId}, ${imageUrl}, ${index})
    `;
  }
}

export function parseIdList(formData, fieldName) {
  return formData
    .getAll(fieldName)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

export function parseTextList(value) {
  return String(value || "")
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapCatalogItem(row) {
  return { id: String(row.id), name: row.name };
}

"use server";

import { sql } from "../db";
import { getCurrentUser, requireCustomer, requireUser } from "../auth";
import { isStaffRole } from "../../lib/roles";

async function getOrCreateCartId(userId) {
  const [existing] = await sql`select id from carts where user_id = ${userId} limit 1`;
  if (existing) {
    return existing.id;
  }

  const [created] = await sql`
    insert into carts (user_id) values (${userId}) returning id
  `;
  return created.id;
}

function mapCartItem(row) {
  return {
    dishId: String(row.dish_id),
    dishName: row.dish_name,
    dishImage: row.dish_image,
    dishPrice: Number(row.unit_price),
    dishCategory: row.dish_category,
    quantity: row.quantity,
  };
}

export async function createCart() {
  const user = await requireUser();
  const cartId = await getOrCreateCartId(user.id);
  return { _id: String(cartId), id: String(cartId) };
}

export async function findCartByUserId() {
  const user = await requireUser();
  const [cart] = await sql`select id from carts where user_id = ${user.id} limit 1`;
  return cart ? { _id: String(cart.id), id: String(cart.id) } : null;
}

export async function getCartItems() {
  const user = await requireUser();
  const userId = Number(user.id);
  const items = await sql`
    select
      cart_items.dish_id,
      cart_items.quantity,
      cart_items.unit_price,
      dishes.name as dish_name,
      dishes.image_url as dish_image,
      dishes.category as dish_category
    from cart_items
    inner join carts on carts.id = cart_items.cart_id
    inner join dishes on dishes.id = cart_items.dish_id
    where carts.user_id = ${userId}
    order by cart_items.created_at
  `;

  return items.map(mapCartItem);
}

/** Suma de unidades en el carrito (para el badge del navbar). */
export async function getCartItemCount() {
  const user = await getCurrentUser();
  if (!user || isStaffRole(user.role)) {
    return 0;
  }

  const userId = Number(user.id);
  if (!Number.isFinite(userId)) {
    return 0;
  }

  const [row] = await sql`
    select coalesce(sum(cart_items.quantity), 0)::int as count
    from cart_items
    inner join carts on carts.id = cart_items.cart_id
    where carts.user_id = ${userId}
  `;

  return Number(row?.count ?? 0);
}

export async function addDishToCart(_userId, _cartId, dishId) {
  const user = await requireCustomer();
  const cartId = await getOrCreateCartId(user.id);

  const [dish] = await sql`
    select id, price from dishes where id = ${dishId} and is_available = true limit 1
  `;
  if (!dish) {
    throw new Error("Platillo no encontrado");
  }

  await sql`
    insert into cart_items (cart_id, dish_id, quantity, unit_price)
    values (${cartId}, ${dish.id}, 1, ${dish.price})
    on conflict (cart_id, dish_id)
    do update set quantity = cart_items.quantity + 1
  `;

  return { ok: true };
}

export async function deleteCartItem(_userId, dishId) {
  const user = await requireUser();
  await sql`
    delete from cart_items
    using carts
    where cart_items.cart_id = carts.id
      and carts.user_id = ${user.id}
      and cart_items.dish_id = ${dishId}
  `;
  return true;
}

/** Actualiza la cantidad de un plato en el carrito (1–10). */
export async function updateCartItemQuantity(dishId, quantity) {
  const user = await requireCustomer();
  const nextQty = Math.min(10, Math.max(1, Number(quantity) || 1));

  await sql`
    update cart_items
    set quantity = ${nextQty}
    from carts
    where cart_items.cart_id = carts.id
      and carts.user_id = ${user.id}
      and cart_items.dish_id = ${dishId}
  `;

  return { ok: true, quantity: nextQty };
}

export async function deleteAllCartItems() {
  const user = await requireUser();
  await sql`
    delete from cart_items
    using carts
    where cart_items.cart_id = carts.id
      and carts.user_id = ${user.id}
  `;
  return true;
}

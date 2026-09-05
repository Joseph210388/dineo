"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "../db";
import { requireAdmin, requireStaff } from "../auth";
import { DEFAULT_PAYMENT_METHOD, isPaymentMethod } from "../../lib/payment-methods";
import {
  listCatalogAllergens,
  listCatalogIngredients,
  loadDishRelations,
  mapCatalogItem,
  parseIdList,
  parseTextList,
  relationsForDish,
  replaceDishRelations,
} from "../dish-relations";

const RESERVATION_STATUSES = ["pending", "confirmed", "cancelled", "completed"];
const USER_ROLES = ["customer", "employee", "admin"];

function toDateText(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return new Date(value).toISOString().slice(0, 10);
}

function mapStaffDish(row, extras = {}) {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image_url,
    extraImages: extras.images || [],
    category: row.category,
    stock: row.stock,
    isAvailable: row.is_available,
    recommendation: row.recommendation || "",
    ingredients: extras.ingredients || [],
    allergens: extras.allergens || [],
    ingredientIds: extras.ingredientIds || [],
    allergenIds: extras.allergenIds || [],
  };
}

function refreshStaff() {
  revalidatePath("/staff");
  revalidatePath("/staff/dishes");
  revalidatePath("/staff/reservations");
  revalidatePath("/staff/users");
  revalidatePath("/staff/ingredients");
  revalidatePath("/staff/allergens");
  revalidatePath("/food");
  revalidatePath("/favorites");
  revalidateTag("dishes");
}

export async function getDashboardStats() {
  await requireStaff();

  const [[money], [catalog], [people], recentReservations] = await Promise.all([
    sql`
      select
        coalesce(sum(total_price) filter (
          where status in ('confirmed', 'completed')
            and reservation_date = current_date
        ), 0) as today_sales,
        coalesce(sum(total_price) filter (
          where status in ('confirmed', 'completed')
            and reservation_date >= date_trunc('month', current_date)::date
        ), 0) as month_sales,
        coalesce(sum(total_price) filter (
          where status in ('confirmed', 'completed')
        ), 0) as all_sales,
        count(*) filter (where status = 'pending') as pending_count,
        count(*) filter (where reservation_date = current_date) as today_reservations
      from reservations
    `,
    sql`
      select
        count(*) as dish_count,
        count(*) filter (where is_available = true) as available_dishes
      from dishes
    `,
    sql`
      select
        count(*) filter (where role = 'customer') as customer_count,
        count(*) filter (where role in ('employee', 'admin')) as staff_count
      from users
      where is_active = true
    `,
    sql`
      select
        reservations.id,
        reservations.reservation_date,
        reservations.reservation_time,
        reservations.total_price,
        reservations.status,
        users.first_name,
        users.last_name
      from reservations
      inner join users on users.id = reservations.user_id
      order by reservations.created_at desc
      limit 6
    `,
  ]);

  return {
    todaySales: Number(money.today_sales),
    monthSales: Number(money.month_sales),
    allSales: Number(money.all_sales),
    pendingCount: Number(money.pending_count),
    todayReservations: Number(money.today_reservations),
    dishCount: Number(catalog.dish_count),
    availableDishes: Number(catalog.available_dishes),
    customerCount: Number(people.customer_count),
    staffCount: Number(people.staff_count),
    recentReservations: recentReservations.map((row) => ({
      id: String(row.id),
      date: toDateText(row.reservation_date),
      time: String(row.reservation_time).slice(0, 5),
      total: Number(row.total_price),
      status: row.status,
      guestName: `${row.first_name} ${row.last_name}`,
    })),
  };
}

export async function listStaffDishes() {
  await requireStaff();

  const dishes = await sql`
    select id, name, description, price, image_url, category, stock, is_available, recommendation
    from dishes
    order by name
  `;

  const extras = await loadDishRelations(dishes.map((dish) => dish.id));
  return dishes.map((dish) => mapStaffDish(dish, relationsForDish(dish.id, extras)));
}

export async function getStaffDish(id) {
  await requireStaff();

  const [dish] = await sql`
    select id, name, description, price, image_url, category, stock, is_available, recommendation
    from dishes
    where id = ${id}
    limit 1
  `;

  if (!dish) {
    return null;
  }

  const extras = await loadDishRelations([dish.id]);
  return mapStaffDish(dish, relationsForDish(dish.id, extras));
}

export async function createDishAction(formData) {
  await requireStaff();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const isAvailable = formData.get("isAvailable") === "on";
  const recommendation = String(formData.get("recommendation") || "").trim();
  const ingredientIds = parseIdList(formData, "ingredientIds");
  const allergenIds = parseIdList(formData, "allergenIds");
  const extraImages = parseTextList(formData.get("extraImages"));

  if (!name || !description || !imageUrl || !category || Number.isNaN(price) || price < 0) {
    return { ok: false, message: "Revisa nombre, descripcion, imagen, categoria y precio" };
  }

  const [dish] = await sql`
    insert into dishes (name, description, price, image_url, category, stock, is_available, recommendation)
    values (${name}, ${description}, ${price}, ${imageUrl}, ${category}, ${Number.isNaN(stock) ? 0 : stock}, ${isAvailable}, ${recommendation || null})
    returning id
  `;

  await replaceDishRelations(dish.id, ingredientIds, allergenIds, extraImages);
  refreshStaff();
  return { ok: true, id: String(dish.id) };
}

export async function updateDishAction(formData) {
  await requireStaff();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const isAvailable = formData.get("isAvailable") === "on";
  const recommendation = String(formData.get("recommendation") || "").trim();
  const ingredientIds = parseIdList(formData, "ingredientIds");
  const allergenIds = parseIdList(formData, "allergenIds");
  const extraImages = parseTextList(formData.get("extraImages"));

  if (!id || !name || !description || !imageUrl || !category || Number.isNaN(price) || price < 0) {
    return { ok: false, message: "Revisa los datos del platillo" };
  }

  await sql`
    update dishes
    set
      name = ${name},
      description = ${description},
      price = ${price},
      image_url = ${imageUrl},
      category = ${category},
      stock = ${Number.isNaN(stock) ? 0 : stock},
      is_available = ${isAvailable},
      recommendation = ${recommendation || null}
    where id = ${id}
  `;

  await replaceDishRelations(id, ingredientIds, allergenIds, extraImages);
  refreshStaff();
  return { ok: true, id };
}

export async function deleteDishAction(formData) {
  await requireStaff();
  const id = String(formData.get("id") || "");
  if (!id) {
    return { ok: false, message: "Falta el platillo" };
  }

  await sql`delete from dishes where id = ${id}`;
  refreshStaff();
  return { ok: true };
}

export async function listStaffReservations() {
  await requireStaff();

  const reservations = await sql`
    select
      reservations.id,
      reservations.reservation_date,
      reservations.reservation_time,
      reservations.number_of_people,
      reservations.total_price,
      reservations.status,
      reservations.notes,
      reservations.payment_method,
      users.first_name,
      users.last_name,
      users.email
    from reservations
    inner join users on users.id = reservations.user_id
    order by reservations.reservation_date desc, reservations.reservation_time desc
  `;

  return reservations.map((row) => ({
    id: String(row.id),
    date: toDateText(row.reservation_date),
    time: String(row.reservation_time).slice(0, 5),
    people: row.number_of_people,
    total: Number(row.total_price),
    status: row.status,
    notes: row.notes,
    paymentMethod: row.payment_method || DEFAULT_PAYMENT_METHOD,
    guestName: `${row.first_name} ${row.last_name}`,
    guestEmail: row.email,
  }));
}

export async function getStaffReservation(id) {
  await requireStaff();

  const [row] = await sql`
    select
      reservations.id,
      reservations.reservation_date,
      reservations.reservation_time,
      reservations.number_of_people,
      reservations.total_price,
      reservations.status,
      reservations.notes,
      reservations.created_at,
      reservations.payment_method,
      users.id as user_id,
      users.first_name,
      users.last_name,
      users.email
    from reservations
    inner join users on users.id = reservations.user_id
    where reservations.id = ${id}
    limit 1
  `;

  if (!row) {
    return null;
  }

  const items = await sql`
    select dish_name, quantity, unit_price
    from reservation_items
    where reservation_id = ${id}
    order by dish_name
  `;

  return {
    id: String(row.id),
    date: toDateText(row.reservation_date),
    time: String(row.reservation_time).slice(0, 5),
    people: row.number_of_people,
    total: Number(row.total_price),
    status: row.status,
    notes: row.notes,
    paymentMethod: row.payment_method || DEFAULT_PAYMENT_METHOD,
    createdAt: row.created_at,
    userId: String(row.user_id),
    guestName: `${row.first_name} ${row.last_name}`,
    guestEmail: row.email,
    items: items.map((item) => ({
      name: item.dish_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.unit_price) * item.quantity,
    })),
  };
}

export async function updateReservationStatusAction(formData) {
  await requireStaff();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !RESERVATION_STATUSES.includes(status)) {
    return { ok: false, message: "Estado no valido" };
  }

  await sql`
    update reservations
    set status = ${status}
    where id = ${id}
  `;

  refreshStaff();
  redirect(`/staff/reservations/${id}`);
}

export async function deleteReservationAction(formData) {
  await requireStaff();
  const id = String(formData.get("id") || "");
  if (!id) {
    return { ok: false, message: "Falta la reserva" };
  }

  await sql`delete from reservations where id = ${id}`;
  refreshStaff();
  redirect("/staff/reservations");
}

export async function listStaffCustomers() {
  await requireStaff();

  const customers = await sql`
    select id, email, first_name, last_name
    from users
    where role = 'customer' and is_active = true
    order by first_name, last_name
  `;

  return customers.map((row) => ({
    id: String(row.id),
    email: row.email,
    name: `${row.first_name} ${row.last_name}`,
  }));
}

export async function createStaffReservationAction(formData) {
  await requireStaff();

  const customerId = Number(formData.get("customerId"));
  const reservationDate = String(formData.get("date") || "");
  const reservationTime = String(formData.get("time") || "");
  const numberOfPeople = Number(formData.get("people") || 0);
  const notes = String(formData.get("notes") || "").trim();
  const paymentMethod = isPaymentMethod(String(formData.get("paymentMethod") || ""))
    ? String(formData.get("paymentMethod"))
    : DEFAULT_PAYMENT_METHOD;

  if (!customerId || !reservationDate || !reservationTime || numberOfPeople < 1) {
    return { ok: false, message: "Faltan cliente, fecha, hora o personas" };
  }

  const [customer] = await sql`
    select id from users where id = ${customerId} and role = 'customer' and is_active = true limit 1
  `;
  if (!customer) {
    return { ok: false, message: "Ese cliente no existe" };
  }

  const dishes = await sql`
    select id, name, price from dishes where is_available = true
  `;

  const lines = [];
  for (const dish of dishes) {
    const quantity = Number(formData.get(`qty_${dish.id}`) || 0);
    if (quantity > 0) {
      lines.push({
        id: dish.id,
        name: dish.name,
        price: Number(dish.price),
        quantity,
      });
    }
  }

  const totalPrice = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const [reservation] = await sql`
    insert into reservations (
      user_id,
      reservation_date,
      reservation_time,
      number_of_people,
      total_price,
      status,
      notes,
      payment_method
    )
    values (
      ${customer.id},
      ${reservationDate},
      ${reservationTime},
      ${numberOfPeople},
      ${totalPrice},
      'confirmed',
      ${notes || null},
      ${paymentMethod}
    )
    returning id
  `;

  for (const line of lines) {
    await sql`
      insert into reservation_items (reservation_id, dish_id, dish_name, quantity, unit_price)
      values (${reservation.id}, ${line.id}, ${line.name}, ${line.quantity}, ${line.price})
    `;
  }

  refreshStaff();
  return { ok: true, id: String(reservation.id) };
}

export async function listStaffUsers() {
  await requireAdmin();

  const users = await sql`
    select id, email, first_name, last_name, role, is_active, created_at
    from users
    order by created_at desc
  `;

  return users.map((row) => ({
    id: String(row.id),
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
}

export async function getStaffUser(id) {
  await requireAdmin();

  const [row] = await sql`
    select id, email, first_name, last_name, role, is_active, created_at
    from users
    where id = ${id}
    limit 1
  `;

  if (!row) {
    return null;
  }

  const [stats] = await sql`
    select
      count(*) as reservation_count,
      coalesce(sum(total_price) filter (where status in ('confirmed', 'completed')), 0) as spent
    from reservations
    where user_id = ${id}
  `;

  return {
    id: String(row.id),
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    reservationCount: Number(stats.reservation_count),
    spent: Number(stats.spent),
  };
}

export async function updateStaffUserAction(formData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const role = String(formData.get("role") || "");
  const isActive = formData.get("isActive") === "on";

  if (!id || !firstName || !lastName || !USER_ROLES.includes(role)) {
    return { ok: false, message: "Revisa nombre y rol" };
  }

  if (id === admin.id && (role !== "admin" || !isActive)) {
    return { ok: false, message: "No puedes quitarte el acceso de administrador" };
  }

  await sql`
    update users
    set first_name = ${firstName}, last_name = ${lastName}, role = ${role}, is_active = ${isActive}
    where id = ${id}
  `;

  refreshStaff();
  redirect(`/staff/users/${id}`);
}

export async function deleteStaffUserAction(formData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");

  if (!id || id === admin.id) {
    return { ok: false, message: "No puedes eliminar tu propia cuenta" };
  }

  await sql`delete from users where id = ${id}`;
  refreshStaff();
  redirect("/staff/users");
}

export async function listStaffCatalogs() {
  await requireStaff();
  const [ingredients, allergens] = await Promise.all([listCatalogIngredients(), listCatalogAllergens()]);
  return {
    ingredients: ingredients.map(mapCatalogItem),
    allergens: allergens.map(mapCatalogItem),
  };
}

export async function createCatalogItemAction(formData) {
  await requireStaff();
  const kind = String(formData.get("kind") || "");
  const name = String(formData.get("name") || "").trim();

  if (!name || (kind !== "ingredient" && kind !== "allergen")) {
    return { ok: false, message: "Escribe un nombre" };
  }

  try {
    if (kind === "ingredient") {
      await sql`insert into ingredients (name) values (${name})`;
    } else {
      await sql`insert into allergens (name) values (${name})`;
    }
  } catch {
    return { ok: false, message: "Ese nombre ya existe" };
  }

  refreshStaff();
  return { ok: true };
}

export async function updateCatalogItemAction(formData) {
  await requireStaff();
  const kind = String(formData.get("kind") || "");
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();

  if (!id || !name || (kind !== "ingredient" && kind !== "allergen")) {
    return { ok: false, message: "Revisa el nombre" };
  }

  try {
    if (kind === "ingredient") {
      await sql`update ingredients set name = ${name} where id = ${id}`;
    } else {
      await sql`update allergens set name = ${name} where id = ${id}`;
    }
  } catch {
    return { ok: false, message: "Ese nombre ya existe" };
  }

  refreshStaff();
  return { ok: true };
}

export async function deleteCatalogItemAction(formData) {
  await requireStaff();
  const kind = String(formData.get("kind") || "");
  const id = String(formData.get("id") || "");

  if (!id || (kind !== "ingredient" && kind !== "allergen")) {
    return { ok: false, message: "Falta el elemento" };
  }

  if (kind === "ingredient") {
    await sql`delete from ingredients where id = ${id}`;
  } else {
    await sql`delete from allergens where id = ${id}`;
  }

  refreshStaff();
  return { ok: true };
}

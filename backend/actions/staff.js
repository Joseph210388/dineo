"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { sql } from "../db";
import { requireAdmin, requireStaff } from "../auth";
import { getCachedDashboardStats } from "../staff-dashboard";
import { DEFAULT_PAYMENT_METHOD, isPaymentMethod, allowsReservationDishEdit } from "../../lib/payment-methods";
import {
  DEFAULT_DIETARY,
  DEFAULT_TABLE_TYPE,
  isDietaryOption,
  isTableType,
} from "../../lib/reservation-preferences";
import { STAFF_RESERVATIONS_FETCH_LIMIT } from "../../lib/search-text";
import { assertTableAvailable, getRestaurantDurationSettings } from "./tables";
import {
  estimateDurationMinutes,
  formatOccupationRange,
} from "../../lib/reservation-duration";
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
  revalidatePath("/staff/settings");
  revalidatePath("/staff/ingredients");
  revalidatePath("/staff/allergens");
  revalidatePath("/staff/categories");
  revalidatePath("/food");
  revalidatePath("/favorites");
  revalidateTag("dishes");
  revalidateTag("staff-dashboard");
}

export async function getDashboardStats() {
  await requireStaff();
  return getCachedDashboardStats();
}

export async function listStaffDishes() {
  await requireStaff();

  // La lista solo pinta foto, nombre y precio; ingredientes/alérgenos se piden al abrir el plato
  const dishes = await sql`
    select id, name, description, price, image_url, category, stock, is_available
    from dishes
    order by name
  `;

  return dishes.map((dish) => mapStaffDish(dish));
}

export async function getStaffDish(id) {
  await requireStaff();

  const [dish] = await sql`
    select id, name, description, price, image_url, category, stock, is_available
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
  // Sin checkbox en el formulario: los platos nuevos quedan visibles en carta
  const isAvailable = true;
  const ingredientIds = parseIdList(formData, "ingredientIds");
  const allergenIds = parseIdList(formData, "allergenIds");
  const extraImages = parseTextList(formData.get("extraImages"));

  if (!name || !description || !imageUrl || !category || Number.isNaN(price) || price < 0) {
    return { ok: false, message: "Revisa nombre, descripcion, imagen, categoria y precio" };
  }

  const [dish] = await sql`
    insert into dishes (name, description, price, image_url, category, stock, is_available)
    values (${name}, ${description}, ${price}, ${imageUrl}, ${category}, ${Number.isNaN(stock) ? 0 : stock}, ${isAvailable})
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
  const ingredientIds = parseIdList(formData, "ingredientIds");
  const allergenIds = parseIdList(formData, "allergenIds");
  const extraImages = parseTextList(formData.get("extraImages"));

  if (!id || !name || !description || !imageUrl || !category || Number.isNaN(price) || price < 0) {
    return { ok: false, message: "Revisa los datos del platillo" };
  }

  // No tocamos is_available: ya no se edita desde el formulario
  await sql`
    update dishes
    set
      name = ${name},
      description = ${description},
      price = ${price},
      image_url = ${imageUrl},
      category = ${category},
      stock = ${Number.isNaN(stock) ? 0 : stock}
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

function mapReservationListRow(row) {
  const time = String(row.reservation_time).slice(0, 5);
  const people = row.number_of_people;
  const durationMinutes =
    row.duration_minutes != null
      ? Number(row.duration_minutes)
      : estimateDurationMinutes(people);
  const range = formatOccupationRange(time, durationMinutes);

  return {
    id: String(row.id),
    date: toDateText(row.reservation_date),
    time,
    endTime: range.end,
    timeRangeLabel: range.label,
    durationMinutes,
    people,
    total: Number(row.total_price),
    status: row.status,
    notes: row.notes,
    paymentMethod: row.payment_method || DEFAULT_PAYMENT_METHOD,
    tableType: row.table_type || DEFAULT_TABLE_TYPE,
    dietaryNote: row.dietary_note || DEFAULT_DIETARY,
    tableId: row.table_id ? String(row.table_id) : null,
    tableNumber: row.table_number != null ? Number(row.table_number) : null,
    guestName: `${row.first_name} ${row.last_name}`,
    guestEmail: row.email,
  };
}

async function loadRecentReservationList() {
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
      reservations.table_type,
      reservations.dietary_note,
      reservations.table_id,
      reservations.duration_minutes,
      restaurant_tables.number as table_number,
      users.first_name,
      users.last_name,
      users.email
    from reservations
    inner join users on users.id = reservations.user_id
    left join restaurant_tables on restaurant_tables.id = reservations.table_id
    order by reservations.reservation_date desc, reservations.reservation_time desc
    limit ${STAFF_RESERVATIONS_FETCH_LIMIT}
  `;

  return reservations.map(mapReservationListRow);
}

async function loadReservationsForDate(dateText) {
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
      reservations.table_type,
      reservations.dietary_note,
      reservations.table_id,
      reservations.duration_minutes,
      restaurant_tables.number as table_number,
      users.first_name,
      users.last_name,
      users.email
    from reservations
    inner join users on users.id = reservations.user_id
    left join restaurant_tables on restaurant_tables.id = reservations.table_id
    where reservations.reservation_date = ${dateText}
    order by reservations.reservation_time asc, reservations.id asc
  `;

  return reservations.map(mapReservationListRow);
}

async function listActiveTables() {
  const rows = await sql`
    select id, number, capacity, label, zone, is_active, sort_order
    from restaurant_tables
    where is_active = true and deleted = false
    order by sort_order asc, number asc
  `;
  return rows.map((row) => ({
    id: String(row.id),
    number: Number(row.number),
    capacity: Number(row.capacity),
    label: row.label || `Mesa ${row.number}`,
    zone: row.zone || "salon",
  }));
}

export async function listStaffReservations() {
  await requireStaff();
  return loadRecentReservationList();
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
      reservations.table_type,
      reservations.dietary_note,
      reservations.kitchen_note,
      reservations.table_id,
      reservations.duration_minutes,
      restaurant_tables.number as table_number,
      restaurant_tables.capacity as table_capacity,
      restaurant_tables.zone as table_zone,
      users.id as user_id,
      users.first_name,
      users.last_name,
      users.email
    from reservations
    inner join users on users.id = reservations.user_id
    left join restaurant_tables on restaurant_tables.id = reservations.table_id
    where reservations.id = ${id}
    limit 1
  `;

  if (!row) {
    return null;
  }

  const items = await sql`
    select dish_id, dish_name, quantity, unit_price
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
    notes: row.notes || "",
    paymentMethod: row.payment_method || DEFAULT_PAYMENT_METHOD,
    tableType: row.table_type || DEFAULT_TABLE_TYPE,
    dietaryNote: row.dietary_note || DEFAULT_DIETARY,
    kitchenNote: row.kitchen_note || "",
    tableId: row.table_id ? String(row.table_id) : null,
    tableNumber: row.table_number != null ? Number(row.table_number) : null,
    tableCapacity: row.table_capacity != null ? Number(row.table_capacity) : null,
    durationMinutes: row.duration_minutes != null ? Number(row.duration_minutes) : null,
    createdAt: row.created_at,
    userId: String(row.user_id),
    guestName: `${row.first_name} ${row.last_name}`,
    guestEmail: row.email,
    canEditDishes: allowsReservationDishEdit(row.payment_method || DEFAULT_PAYMENT_METHOD),
    items: items.map((item) => ({
      dishId: item.dish_id ? String(item.dish_id) : null,
      name: item.dish_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.unit_price) * item.quantity,
    })),
  };
}

/**
 * Edita detalles operativos (mesa, fecha, etc.).
 * Platos + total solo si el pago es en el local (aún no cobrado online).
 */
export async function updateStaffReservationDetailsAction(formData) {
  await requireStaff();

  const id = String(formData.get("id") || "").trim();
  const reservationDate = String(formData.get("date") || "").trim();
  const reservationTime = String(formData.get("time") || "").trim();
  const numberOfPeople = Number(formData.get("people") || 0);
  const status = String(formData.get("status") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  const kitchenNote = String(formData.get("kitchenNote") || "").trim().slice(0, 280);
  const tableIdRaw = String(formData.get("tableId") || "").trim();
  const tableId = tableIdRaw ? Number(tableIdRaw) : null;
  const tableType = isTableType(String(formData.get("tableType") || ""))
    ? String(formData.get("tableType"))
    : DEFAULT_TABLE_TYPE;
  const dietaryNote = isDietaryOption(String(formData.get("dietaryNote") || ""))
    ? String(formData.get("dietaryNote"))
    : DEFAULT_DIETARY;
  const editDishesFlag = String(formData.get("editDishes") || "") === "1";

  if (!id || !reservationDate || !reservationTime || numberOfPeople < 1) {
    return { ok: false, message: "Faltan fecha, hora o personas" };
  }
  if (!RESERVATION_STATUSES.includes(status)) {
    return { ok: false, message: "Estado no válido" };
  }

  const [existing] = await sql`
    select id, payment_method, total_price
    from reservations
    where id = ${Number(id)}
    limit 1
  `;
  if (!existing) {
    return { ok: false, message: "Reserva no encontrada" };
  }

  const paymentMethod = existing.payment_method || DEFAULT_PAYMENT_METHOD;
  const canEditDishes = allowsReservationDishEdit(paymentMethod);

  if (editDishesFlag && !canEditDishes) {
    return {
      ok: false,
      message:
        "Con tarjeta o Bizum no se pueden cambiar platos (habría que devolver o ajustar el cobro). Cancela y crea otra reserva.",
    };
  }

  let resolvedTableId = null;
  let resolvedTableType = tableType;
  let durationMinutes;

  if (tableId) {
    const availability = await assertTableAvailable({
      tableId,
      date: reservationDate,
      time: reservationTime,
      people: numberOfPeople,
      excludeReservationId: id,
    });
    if (!availability.ok) {
      return { ok: false, message: availability.message || "Esa mesa no está disponible" };
    }
    resolvedTableId = Number(availability.table.id);
    durationMinutes = availability.durationMinutes;
    if (isTableType(availability.table.zone)) {
      resolvedTableType = availability.table.zone;
    }
  } else {
    const settings = await getRestaurantDurationSettings();
    durationMinutes = estimateDurationMinutes(numberOfPeople, settings);
  }

  let nextTotal = Number(existing.total_price);

  if (editDishesFlag && canEditDishes) {
    // Incluye platos ya en la reserva aunque se hayan ocultado de la carta
    const dishes = await sql`
      select id, name, price
      from dishes
      where is_available = true
         or id in (
           select dish_id from reservation_items
           where reservation_id = ${Number(id)} and dish_id is not null
         )
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
    nextTotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

    await sql`delete from reservation_items where reservation_id = ${Number(id)}`;
    for (const line of lines) {
      await sql`
        insert into reservation_items (reservation_id, dish_id, dish_name, quantity, unit_price)
        values (${Number(id)}, ${line.id}, ${line.name}, ${line.quantity}, ${line.price})
      `;
    }
  }

  await sql`
    update reservations
    set
      reservation_date = ${reservationDate},
      reservation_time = ${reservationTime},
      number_of_people = ${numberOfPeople},
      status = ${status},
      notes = ${notes},
      dietary_note = ${dietaryNote},
      kitchen_note = ${kitchenNote},
      table_type = ${resolvedTableType},
      table_id = ${resolvedTableId},
      duration_minutes = ${durationMinutes},
      total_price = ${nextTotal}
    where id = ${Number(id)}
  `;

  refreshStaff();
  revalidatePath("/staff/reservations");
  revalidatePath(`/staff/reservations/${id}`);
  return { ok: true, total: nextTotal };
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
  revalidatePath("/staff/reservations");
  return { ok: true };
}

/** @deprecated Prefer deleteReservationAction (ya no redirige). */
export async function deleteReservationAndRedirectAction(formData) {
  const result = await deleteReservationAction(formData);
  if (result.ok) {
    redirect("/staff/reservations");
  }
  return result;
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

export async function getStaffReservationsPageData(dateText) {
  await requireStaff();

  const day =
    typeof dateText === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateText)
      ? dateText
      : new Date().toISOString().slice(0, 10);

  const [dayReservations, tables, customerRows, dishRows] = await Promise.all([
    loadReservationsForDate(day),
    listActiveTables(),
    sql`
      select id, email, first_name, last_name
      from users
      where role = 'customer' and is_active = true
      order by first_name, last_name
    `,
    sql`
      select id, name, price
      from dishes
      where is_available = true
      order by name
    `,
  ]);

  const activeDay = dayReservations.filter((item) => item.status !== "cancelled");
  const reservedTableIds = new Set(activeDay.map((item) => item.tableId).filter(Boolean));
  const tablesWithStatus = tables.map((table) => {
    const slots = activeDay
      .filter((item) => item.tableId === table.id)
      .map((item) => ({
        id: item.id,
        time: item.time,
        endTime: item.endTime,
        timeRangeLabel: item.timeRangeLabel,
        durationMinutes: item.durationMinutes,
        people: item.people,
        guestName: item.guestName,
      }));
    return {
      ...table,
      status: slots.length ? "reserved" : "available",
      slots,
    };
  });

  return {
    date: day,
    reservations: dayReservations,
    stats: {
      totalReservations: activeDay.length,
      diners: activeDay.reduce((sum, item) => sum + Number(item.people || 0), 0),
      reservedTables: reservedTableIds.size,
      availableTables: Math.max(0, tables.length - reservedTableIds.size),
    },
    tables: tablesWithStatus,
    customers: customerRows.map((row) => ({
      id: String(row.id),
      email: row.email,
      name: `${row.first_name} ${row.last_name}`,
    })),
    dishes: dishRows.map((row) => ({
      id: String(row.id),
      name: row.name,
      price: Number(row.price),
    })),
  };
}

export async function createStaffReservationAction(formData) {
  await requireStaff();

  let customerId = Number(formData.get("customerId"));
  const guestMode = String(formData.get("guestMode") || "existing") === "new";
  const reservationDate = String(formData.get("date") || "");
  const reservationTime = String(formData.get("time") || "");
  const numberOfPeople = Number(formData.get("people") || 0);
  const notesInput = String(formData.get("notes") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const tableIdRaw = String(formData.get("tableId") || "").trim();
  const tableId = tableIdRaw ? Number(tableIdRaw) : null;
  const tableType = isTableType(String(formData.get("tableType") || ""))
    ? String(formData.get("tableType"))
    : DEFAULT_TABLE_TYPE;
  const dietaryNote = isDietaryOption(String(formData.get("dietaryNote") || ""))
    ? String(formData.get("dietaryNote"))
    : DEFAULT_DIETARY;
  const kitchenNote = String(formData.get("kitchenNote") || "").trim().slice(0, 280);
  const paymentMethod = isPaymentMethod(String(formData.get("paymentMethod") || ""))
    ? String(formData.get("paymentMethod"))
    : DEFAULT_PAYMENT_METHOD;

  if (guestMode) {
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim() || "—";
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    if (!firstName || !email || !email.includes("@")) {
      return { ok: false, message: "Para un cliente nuevo hacen falta nombre y correo" };
    }

    const [existing] = await sql`
      select id from users where email = ${email} limit 1
    `;
    if (existing) {
      customerId = Number(existing.id);
    } else {
      // Cuenta mínima para el walk-in; el cliente podrá recuperar acceso más adelante
      const passwordHash = await bcrypt.hash(`walkin-${Date.now()}-${Math.random()}`, 10);
      const [created] = await sql`
        insert into users (email, password_hash, first_name, last_name, role, is_active)
        values (${email}, ${passwordHash}, ${firstName}, ${lastName}, 'customer', true)
        returning id
      `;
      customerId = Number(created.id);
    }
  }

  if (!customerId || !reservationDate || !reservationTime || numberOfPeople < 1) {
    return { ok: false, message: "Faltan cliente, fecha, hora o personas" };
  }

  const [customer] = await sql`
    select id from users where id = ${customerId} and role = 'customer' and is_active = true limit 1
  `;
  if (!customer) {
    return { ok: false, message: "Ese cliente no existe" };
  }

  let resolvedTableId = null;
  let resolvedTableType = tableType;
  let durationMinutes = null;

  if (tableId) {
    const availability = await assertTableAvailable({
      tableId,
      date: reservationDate,
      time: reservationTime,
      people: numberOfPeople,
    });
    if (!availability.ok) {
      return { ok: false, message: availability.message || "Esa mesa no está disponible" };
    }
    resolvedTableId = Number(availability.table.id);
    durationMinutes = availability.durationMinutes;
    if (isTableType(availability.table.zone)) {
      resolvedTableType = availability.table.zone;
    }
  } else {
    // Sin mesa física: igual estimamos duración por comensales
    const settings = await getRestaurantDurationSettings();
    durationMinutes = estimateDurationMinutes(numberOfPeople, settings);
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

  const noteParts = [];
  if (notesInput) noteParts.push(notesInput);
  if (phone) noteParts.push(`Tel: ${phone}`);
  if (address) noteParts.push(`Dir: ${address}`);
  const notes = noteParts.length ? noteParts.join(" · ") : null;

  const [reservation] = await sql`
    insert into reservations (
      user_id,
      reservation_date,
      reservation_time,
      number_of_people,
      total_price,
      status,
      notes,
      payment_method,
      table_type,
      dietary_note,
      kitchen_note,
      table_id,
      duration_minutes
    )
    values (
      ${customer.id},
      ${reservationDate},
      ${reservationTime},
      ${numberOfPeople},
      ${totalPrice},
      'confirmed',
      ${notes},
      ${paymentMethod},
      ${resolvedTableType},
      ${dietaryNote},
      ${kitchenNote},
      ${resolvedTableId},
      ${durationMinutes}
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
  revalidatePath("/staff/reservations");
  return { ok: true, id: String(reservation.id) };
}

function mapStaffUserRow(row, stats = null) {
  return {
    id: String(row.id),
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    photo: row.photo_url || "",
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    reservationCount: stats ? Number(stats.reservation_count) : undefined,
    spent: stats ? Number(stats.spent) : undefined,
  };
}

export async function listStaffUsers() {
  await requireAdmin();

  const users = await sql`
    select id, email, first_name, last_name, photo_url, role, is_active, created_at
    from users
    order by created_at desc
  `;

  return users.map((row) => mapStaffUserRow(row));
}

export async function getStaffUser(id) {
  await requireAdmin();

  const [row] = await sql`
    select id, email, first_name, last_name, photo_url, role, is_active, created_at
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

  return mapStaffUserRow(row, stats);
}

/** Reservas de un cliente concreto (popup Ver perfil → registros). */
export async function listStaffUserReservations(userId) {
  await requireAdmin();
  const id = String(userId || "");
  if (!id) {
    return [];
  }

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
    where reservations.user_id = ${id}
    order by reservations.reservation_date desc, reservations.reservation_time desc
  `;

  return reservations.map(mapReservationListRow);
}

export async function updateStaffUserAction(formData) {
  const result = await saveStaffUserFromForm(formData);
  if (!result.ok) {
    return result;
  }
  redirect(`/staff/users/${result.id}`);
}

/** Guarda perfil/rol desde el popup (sin redirect). */
export async function saveStaffUserPopupAction(payload) {
  const admin = await requireAdmin();
  const id = String(payload?.id || "");
  const firstName = String(payload?.firstName || "").trim();
  const lastName = String(payload?.lastName || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  const role = String(payload?.role || "");
  const isActive = Boolean(payload?.isActive);

  if (!id || !firstName || !lastName || !email || !USER_ROLES.includes(role)) {
    return { ok: false, message: "Revisa nombre, correo y rol" };
  }

  if (id === admin.id && (role !== "admin" || !isActive)) {
    return { ok: false, message: "No puedes quitarte el acceso de administrador" };
  }

  try {
    await sql`
      update users
      set
        first_name = ${firstName},
        last_name = ${lastName},
        email = ${email},
        role = ${role},
        is_active = ${isActive}
      where id = ${id}
    `;
  } catch (error) {
    if (String(error?.message || "").toLowerCase().includes("unique")) {
      return { ok: false, message: "Ese correo ya está en uso" };
    }
    return { ok: false, message: "No se pudo guardar el usuario" };
  }

  refreshStaff();
  return { ok: true, id };
}

/** Cambia solo el rol desde la tabla (candado en la propia cuenta). */
export async function updateStaffUserRoleAction({ id, role }) {
  const admin = await requireAdmin();
  const userId = String(id || "");
  const nextRole = String(role || "");

  if (!userId || !USER_ROLES.includes(nextRole)) {
    return { ok: false, message: "Rol no válido" };
  }

  if (userId === admin.id) {
    return { ok: false, message: "No puedes cambiar el rol de tu propia cuenta" };
  }

  await sql`update users set role = ${nextRole} where id = ${userId}`;
  refreshStaff();
  return { ok: true };
}

/** El admin fija una contraseña nueva (sin pedir la anterior). */
export async function setStaffUserPasswordAction({ id, newPassword }) {
  const admin = await requireAdmin();
  const userId = String(id || "");
  const next = String(newPassword || "");

  if (!userId) {
    return { ok: false, message: "Usuario no válido" };
  }
  if (next.length < 8) {
    return { ok: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }

  const passwordHash = await bcrypt.hash(next, 12);
  await sql`update users set password_hash = ${passwordHash} where id = ${userId}`;
  // Cierra sesiones ajenas; si es la propia, el admin sigue con la cookie actual
  if (userId !== admin.id) {
    await sql`delete from sessions where user_id = ${userId}`;
  }
  refreshStaff();
  return { ok: true };
}

export async function deleteStaffUserAction(formData) {
  const result = await removeStaffUserPopupAction({ id: formData.get("id") });
  if (!result.ok) {
    return result;
  }
  redirect("/staff/users");
}

export async function removeStaffUserPopupAction({ id }) {
  const admin = await requireAdmin();
  const userId = String(id || "");

  if (!userId || userId === admin.id) {
    return { ok: false, message: "No puedes eliminar tu propia cuenta" };
  }

  await sql`delete from users where id = ${userId}`;
  refreshStaff();
  return { ok: true };
}

async function saveStaffUserFromForm(formData) {
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
  return { ok: true, id };
}

export async function listStaffCatalogs() {
  await requireStaff();
  const ingredients = await listCatalogIngredients();
  const allergens = await listCatalogAllergens();
  const categories = await sql`select id, name from categories order by name`;
  return {
    ingredients: ingredients.map(mapCatalogItem),
    allergens: allergens.map(mapCatalogItem),
    categories: categories.map(mapCatalogItem),
  };
}

export async function listStaffIngredients() {
  await requireStaff();
  const ingredients = await listCatalogIngredients();
  return ingredients.map(mapCatalogItem);
}

export async function listStaffAllergens() {
  await requireStaff();
  const allergens = await listCatalogAllergens();
  return allergens.map(mapCatalogItem);
}

export async function listStaffCategories() {
  await requireStaff();
  const categories = await sql`select id, name from categories order by name`;
  return categories.map(mapCatalogItem);
}

export async function createCatalogItemAction(formData) {
  await requireStaff();
  const kind = String(formData.get("kind") || "");
  const name = String(formData.get("name") || "").trim();

  if (!name || !["ingredient", "allergen", "category"].includes(kind)) {
    return { ok: false, message: "Escribe un nombre" };
  }

  try {
    if (kind === "ingredient") {
      await sql`insert into ingredients (name) values (${name})`;
    } else if (kind === "allergen") {
      await sql`insert into allergens (name) values (${name})`;
    } else {
      await sql`insert into categories (name) values (${name})`;
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

  if (!id || !name || !["ingredient", "allergen", "category"].includes(kind)) {
    return { ok: false, message: "Revisa el nombre" };
  }

  try {
    if (kind === "ingredient") {
      await sql`update ingredients set name = ${name} where id = ${id}`;
    } else if (kind === "allergen") {
      await sql`update allergens set name = ${name} where id = ${id}`;
    } else {
      const [previous] = await sql`select name from categories where id = ${id} limit 1`;
      if (!previous) {
        return { ok: false, message: "Categoría no encontrada" };
      }
      await sql`update categories set name = ${name} where id = ${id}`;
      // Los platos guardan el nombre de categoría en texto
      await sql`update dishes set category = ${name} where category = ${previous.name}`;
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

  if (!id || !["ingredient", "allergen", "category"].includes(kind)) {
    return { ok: false, message: "Falta el elemento" };
  }

  if (kind === "ingredient") {
    await sql`delete from ingredients where id = ${id}`;
  } else if (kind === "allergen") {
    await sql`delete from allergens where id = ${id}`;
  } else {
    const [row] = await sql`select name from categories where id = ${id} limit 1`;
    if (row) {
      const [{ count }] = await sql`
        select count(*)::int as count from dishes where category = ${row.name}
      `;
      if (count > 0) {
        return {
          ok: false,
          message: `Hay ${count} plato(s) con esta categoría. Cámbialos antes de borrarla.`,
        };
      }
    }
    await sql`delete from categories where id = ${id}`;
  }

  refreshStaff();
  return { ok: true };
}

"use server";

import { sql } from "../db";
import { requireCustomer } from "../auth";
import { deleteAllCartItems, getCartItems } from "./cart";
import { assertTableAvailable } from "./tables";
import { DEFAULT_PAYMENT_METHOD, isPaymentMethod } from "../../lib/payment-methods";
import {
  DEFAULT_DIETARY,
  DEFAULT_TABLE_TYPE,
  isDietaryOption,
  isTableType,
} from "../../lib/reservation-preferences";

export async function createReservation(
  _userId,
  _dishDetail,
  totalPrice,
  reservationDate,
  reservationTime,
  numberOfPeople,
  paymentMethod = DEFAULT_PAYMENT_METHOD,
  guestName = "",
  contactPhone = "",
  contactEmail = "",
  tableType = DEFAULT_TABLE_TYPE,
  dietaryNote = DEFAULT_DIETARY,
  kitchenNote = "",
  tableId = null
) {
  const user = await requireCustomer();
  const items = await getCartItems();
  const method = isPaymentMethod(paymentMethod) ? paymentMethod : DEFAULT_PAYMENT_METHOD;
  const dietary = isDietaryOption(dietaryNote) ? dietaryNote : DEFAULT_DIETARY;
  const kitchen = String(kitchenNote || "").trim().slice(0, 280);
  const accountName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const reservedFor = String(guestName || "").trim() || accountName;
  const phone = String(contactPhone || "").trim();
  const email = String(contactEmail || "").trim() || user.email || "";
  const noteParts = [];
  if (reservedFor) noteParts.push(`A nombre de: ${reservedFor}`);
  if (phone) noteParts.push(`Tel: ${phone}`);
  if (email) noteParts.push(`Email: ${email}`);
  const notes = noteParts.length ? noteParts.join(" · ") : null;

  if (!items.length) {
    throw new Error("El carrito esta vacio");
  }

  if (!tableId) {
    throw new Error("Debes elegir una mesa");
  }

  const availability = await assertTableAvailable({
    tableId,
    date: reservationDate,
    time: reservationTime,
    people: numberOfPeople,
  });

  if (!availability.ok) {
    throw new Error(availability.message || "Esa mesa no está disponible");
  }

  const resolvedTableType = isTableType(availability.table.zone)
    ? availability.table.zone
    : isTableType(tableType)
      ? tableType
      : DEFAULT_TABLE_TYPE;
  const durationMinutes = availability.durationMinutes;

  const [reservation] = await sql`
    insert into reservations (
      user_id,
      reservation_date,
      reservation_time,
      number_of_people,
      total_price,
      status,
      payment_method,
      table_type,
      dietary_note,
      kitchen_note,
      notes,
      table_id,
      duration_minutes
    )
    values (
      ${user.id},
      ${reservationDate},
      ${reservationTime},
      ${numberOfPeople},
      ${totalPrice},
      'confirmed',
      ${method},
      ${resolvedTableType},
      ${dietary},
      ${kitchen},
      ${notes},
      ${Number(availability.table.id)},
      ${durationMinutes}
    )
    returning id, reservation_date, reservation_time, number_of_people, total_price, status, payment_method, table_type, dietary_note, kitchen_note, notes, table_id, duration_minutes
  `;

  for (const item of items) {
    await sql`
      insert into reservation_items (reservation_id, dish_id, dish_name, quantity, unit_price)
      values (${reservation.id}, ${item.dishId}, ${item.dishName}, ${item.quantity}, ${item.dishPrice})
    `;
  }

  await deleteAllCartItems();
  return { _id: String(reservation.id), ...reservation };
}

export async function getReservationsByUser() {
  const user = await requireCustomer();
  const reservations = await sql`
    select
      id,
      reservation_date,
      reservation_time,
      number_of_people,
      total_price,
      status,
      payment_method,
      table_type,
      dietary_note,
      kitchen_note,
      notes,
      table_id,
      duration_minutes
    from reservations
    where user_id = ${user.id}
    order by reservation_date desc, reservation_time desc
  `;

  const result = [];
  for (const reservation of reservations) {
    const dishes = await sql`
      select dish_name, quantity, unit_price
      from reservation_items
      where reservation_id = ${reservation.id}
      order by dish_name
    `;

    const reservationDate =
      typeof reservation.reservation_date === "string"
        ? reservation.reservation_date.slice(0, 10)
        : new Date(reservation.reservation_date).toISOString().slice(0, 10);

    result.push({
      _id: String(reservation.id),
      reservationDate,
      reservationTime: String(reservation.reservation_time).slice(0, 5),
      numberOfPeople: reservation.number_of_people,
      total_price: Number(reservation.total_price),
      status: reservation.status,
      paymentMethod: reservation.payment_method || DEFAULT_PAYMENT_METHOD,
      tableType: reservation.table_type || DEFAULT_TABLE_TYPE,
      dietaryNote: reservation.dietary_note || DEFAULT_DIETARY,
      kitchenNote: reservation.kitchen_note || "",
      notes: reservation.notes || "",
      tableId: reservation.table_id ? String(reservation.table_id) : null,
      durationMinutes: reservation.duration_minutes != null ? Number(reservation.duration_minutes) : null,
      dishDetail: dishes.map((dish) => ({
        dishName: dish.dish_name,
        quantity: dish.quantity,
        unitPrice: Number(dish.unit_price),
      })),
    });
  }

  return result;
}

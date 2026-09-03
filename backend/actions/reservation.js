"use server";

import { sql } from "../db";
import { requireUser } from "../auth";
import { deleteAllCartItems, getCartItems } from "./cart";

export async function createReservation(
  _userId,
  _dishDetail,
  totalPrice,
  reservationDate,
  reservationTime,
  numberOfPeople
) {
  const user = await requireUser();
  const items = await getCartItems();

  if (!items.length) {
    throw new Error("El carrito esta vacio");
  }

  const [reservation] = await sql`
    insert into reservations (
      user_id,
      reservation_date,
      reservation_time,
      number_of_people,
      total_price,
      status
    )
    values (
      ${user.id},
      ${reservationDate},
      ${reservationTime},
      ${numberOfPeople},
      ${totalPrice},
      'confirmed'
    )
    returning id, reservation_date, reservation_time, number_of_people, total_price, status
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
  const user = await requireUser();
  const reservations = await sql`
    select id, reservation_date, reservation_time, number_of_people, total_price, status
    from reservations
    where user_id = ${user.id}
    order by reservation_date desc, reservation_time desc
  `;

  const result = [];
  for (const reservation of reservations) {
    const dishes = await sql`
      select dish_name, quantity
      from reservation_items
      where reservation_id = ${reservation.id}
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
      dishDetail: dishes.map((dish) => ({
        dishName: dish.dish_name,
        quantity: dish.quantity,
      })),
    });
  }

  return result;
}

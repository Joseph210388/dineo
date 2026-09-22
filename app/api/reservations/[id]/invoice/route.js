import { NextResponse } from "next/server";
import { sql } from "../../../../backend/db";
import { getSessionPayload } from "../../../../backend/auth";
import { isStaffRole } from "../../../../backend/session-token";
import { formatDate, formatTime } from "../../../../backend/staff-format";
import { DEFAULT_PAYMENT_METHOD } from "../../../../lib/payment-methods";
import {
  DEFAULT_DIETARY,
  DEFAULT_TABLE_TYPE,
} from "../../../../lib/reservation-preferences";
import {
  buildInvoiceViewModel,
  buildReservationInvoicePdf,
} from "../../../../lib/reservation-invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const reservationId = Number(id);
  if (!reservationId) {
    return NextResponse.json({ error: "Reserva no válida" }, { status: 400 });
  }

  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Inicia sesión para descargar el comprobante" }, { status: 401 });
  }

  const [row] = await sql`
    select
      id,
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
      notes
    from reservations
    where id = ${reservationId}
    limit 1
  `;

  if (!row) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const isOwner = Number(row.user_id) === Number(session.sub);
  const isStaff = isStaffRole(session.role);
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "No tienes acceso a esta reserva" }, { status: 403 });
  }

  const items = await sql`
    select dish_name, quantity, unit_price
    from reservation_items
    where reservation_id = ${row.id}
    order by dish_name
  `;

  const [user] = await sql`
    select first_name, last_name from users where id = ${row.user_id} limit 1
  `;
  const guestFallback = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() || "Cliente";

  const reservationDate =
    typeof row.reservation_date === "string"
      ? row.reservation_date.slice(0, 10)
      : new Date(row.reservation_date).toISOString().slice(0, 10);

  const view = buildInvoiceViewModel(
    {
      id: row.id,
      status: row.status,
      notes: row.notes,
      numberOfPeople: row.number_of_people,
      tableType: row.table_type || DEFAULT_TABLE_TYPE,
      dietaryNote: row.dietary_note || DEFAULT_DIETARY,
      kitchenNote: row.kitchen_note || "",
      paymentMethod: row.payment_method || DEFAULT_PAYMENT_METHOD,
      totalPrice: Number(row.total_price),
      dateLabel: formatDate(reservationDate),
      timeLabel: formatTime(String(row.reservation_time).slice(0, 5)),
      items: items.map((item) => ({
        dishName: item.dish_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
      })),
    },
    { guestFallback }
  );

  const bytes = await buildReservationInvoicePdf(view);
  const filename = `taipei-reserva-${String(row.id).padStart(4, "0")}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

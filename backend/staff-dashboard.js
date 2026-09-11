import { unstable_cache } from "next/cache";
import { sql } from "./db";

function toDateText(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return new Date(value).toISOString().slice(0, 10);
}

async function queryDashboardStats() {
  // Un pase por tabla con FILTER: evita muchas subconsultas correlacionadas
  const [row] = await sql`
    with reservation_stats as (
      select
        coalesce(
          sum(total_price) filter (
            where status in ('confirmed', 'completed')
              and reservation_date = current_date
          ),
          0
        ) as today_sales,
        coalesce(
          sum(total_price) filter (
            where status in ('confirmed', 'completed')
              and reservation_date >= date_trunc('month', current_date)::date
          ),
          0
        ) as month_sales,
        coalesce(
          sum(total_price) filter (where status in ('confirmed', 'completed')),
          0
        ) as all_sales,
        count(*) filter (where status = 'pending')::int as pending_count,
        count(*) filter (where reservation_date = current_date)::int as today_reservations
      from reservations
    ),
    dish_stats as (
      select
        count(*)::int as dish_count,
        count(*) filter (where is_available = true)::int as available_dishes
      from dishes
    ),
    user_stats as (
      select
        count(*) filter (where is_active = true and role = 'customer')::int as customer_count,
        count(*) filter (where is_active = true and role in ('employee', 'admin'))::int as staff_count
      from users
    ),
    recent as (
      select coalesce(
        json_agg(item order by item.created_at desc),
        '[]'::json
      ) as recent_reservations
      from (
        select
          reservations.id,
          reservations.reservation_date,
          reservations.reservation_time,
          reservations.total_price,
          reservations.status,
          reservations.created_at,
          users.first_name,
          users.last_name
        from reservations
        inner join users on users.id = reservations.user_id
        order by reservations.created_at desc
        limit 6
      ) as item
    )
    select
      reservation_stats.*,
      dish_stats.*,
      user_stats.*,
      recent.recent_reservations
    from reservation_stats, dish_stats, user_stats, recent
  `;

  const recentReservations = Array.isArray(row.recent_reservations) ? row.recent_reservations : [];

  return {
    todaySales: Number(row.today_sales),
    monthSales: Number(row.month_sales),
    allSales: Number(row.all_sales),
    pendingCount: Number(row.pending_count),
    todayReservations: Number(row.today_reservations),
    dishCount: Number(row.dish_count),
    availableDishes: Number(row.available_dishes),
    customerCount: Number(row.customer_count),
    staffCount: Number(row.staff_count),
    recentReservations: recentReservations.map((reservation) => ({
      id: String(reservation.id),
      date: toDateText(reservation.reservation_date),
      time: String(reservation.reservation_time).slice(0, 5),
      total: Number(reservation.total_price),
      status: reservation.status,
      guestName: `${reservation.first_name} ${reservation.last_name}`,
    })),
  };
}

// Caché corta: el resumen no necesita ir a Postgres en cada clic del menú
export const getCachedDashboardStats = unstable_cache(queryDashboardStats, ["staff-dashboard-stats"], {
  revalidate: 30,
  tags: ["staff-dashboard"],
});

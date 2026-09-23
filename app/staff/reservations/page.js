import { getStaffReservationsPageData } from "../../../backend/actions/staff";
import StaffReservationsDayBoard from "../../../components/staff/staff-reservations-day-board";

export default async function StaffReservationsPage({ searchParams }) {
  const params = await searchParams;
  const requested = typeof params?.date === "string" ? params.date : "";
  const data = await getStaffReservationsPageData(requested);

  return (
    <main className="w-full">
      <StaffReservationsDayBoard
        date={data.date}
        stats={data.stats}
        tables={data.tables}
        reservations={data.reservations}
      />
    </main>
  );
}

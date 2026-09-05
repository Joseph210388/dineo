import { getStaffReservationsPageData } from "../../../backend/actions/staff";
import StaffReservationForm from "../../../components/staff/staff-reservation-form";
import StaffReservationsBoard from "../../../components/staff/staff-reservations-board";

export default async function StaffReservationsPage() {
  const { reservations, customers, dishes } = await getStaffReservationsPageData();

  return (
    <main className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Reservas</h1>
          <p className="mt-1 text-sm text-stone-500">
            El personal apunta aquí las mesas. En la web pública un trabajador no puede reservar.
          </p>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-stone-900">Nueva reserva</h2>
        <StaffReservationForm customers={customers} dishes={dishes} />
      </section>

      {reservations.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          Todavía no hay reservas.
        </p>
      ) : (
        <StaffReservationsBoard reservations={reservations} />
      )}
    </main>
  );
}

import Link from "next/link";
import { listStaffDishes } from "../../../backend/actions/staff";
import { formatMoney } from "../../../backend/staff-format";

export default async function StaffDishesPage() {
  const dishes = await listStaffDishes();

  return (
    <main className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Carta</h1>
          <p className="mt-1 text-sm text-stone-500">Crea, edita u oculta platillos de Taipei.</p>
        </div>
        <Link
          href="/staff/dishes/new"
          className="inline-flex w-fit rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nuevo plato
        </Link>
      </div>

      {dishes.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          No hay platillos. Crea el primero.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 md:grid">
            <span>Plato</span>
            <span>Categoría</span>
            <span>Precio</span>
            <span>Estado</span>
          </div>
          <ul className="divide-y divide-stone-100">
            {dishes.map((dish) => (
              <li key={dish.id}>
                <Link
                  href={`/staff/dishes/${dish.id}`}
                  className="grid grid-cols-1 gap-1 px-4 py-3 transition hover:bg-stone-50 sm:px-5 md:grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr] md:items-center md:gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-800">{dish.name}</p>
                    <p className="truncate text-xs text-stone-500 md:hidden">{dish.category}</p>
                  </div>
                  <p className="hidden text-sm text-stone-600 md:block">{dish.category}</p>
                  <p className="text-sm text-stone-800">{formatMoney(dish.price)}</p>
                  <p className={`text-xs font-medium ${dish.isAvailable ? "text-emerald-700" : "text-stone-500"}`}>
                    {dish.isAvailable ? "En carta" : "Oculto"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

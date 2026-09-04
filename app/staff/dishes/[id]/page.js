import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDishAction, getStaffDish, updateDishAction } from "../../../../backend/actions/staff";
import DishForm from "../../../../components/staff/dish-form";
import ConfirmForm from "../../../../components/staff/confirm-form";

export default async function StaffDishDetailPage({ params }) {
  const { id } = await params;
  const dish = await getStaffDish(id);

  if (!dish) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      <Link href="/staff/dishes" className="text-sm text-red-700 hover:underline">
        Volver a la carta
      </Link>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">{dish.name}</h1>
          <p className="mt-1 text-sm text-stone-500">Edita los datos o quítalo de la carta.</p>
        </div>
        <ConfirmForm action={deleteDishAction} message="¿Eliminar este platillo?">
          <input type="hidden" name="id" value={dish.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Eliminar
          </button>
        </ConfirmForm>
      </div>
      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        <DishForm action={updateDishAction} dish={dish} submitLabel="Guardar cambios" />
      </section>
    </main>
  );
}

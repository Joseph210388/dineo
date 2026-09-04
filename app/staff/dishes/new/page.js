import Link from "next/link";
import { createDishAction } from "../../../../backend/actions/staff";
import DishForm from "../../../../components/staff/dish-form";

export default function NewDishPage() {
  return (
    <main className="mx-auto w-full max-w-3xl">
      <Link href="/staff/dishes" className="text-sm text-red-700 hover:underline">
        Volver a la carta
      </Link>
      <h1 className="mt-3 text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Nuevo plato</h1>
      <p className="mt-1 text-sm text-stone-500">Se verá en la web si lo dejas visible.</p>
      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        <DishForm action={createDishAction} submitLabel="Crear plato" />
      </section>
    </main>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none ring-red-700/20 focus:border-red-700 focus:ring-4";

export default function DishForm({ action, dish, submitLabel }) {
  const ingredientsValue = dish?.ingredients?.join(", ") || "";
  const allergensValue = dish?.allergens?.join(", ") || "";
  const extraImagesValue = dish?.extraImages?.join("\n") || "";

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {dish ? <input type="hidden" name="id" value={dish.id} /> : null}

      <label className="block text-sm font-medium text-stone-700">
        Nombre
        <input className={inputClass} name="name" defaultValue={dish?.name || ""} required />
      </label>

      <label className="block text-sm font-medium text-stone-700">
        Categoría
        <input
          className={inputClass}
          name="category"
          defaultValue={dish?.category || ""}
          placeholder="Entrante, principal, postre..."
          required
        />
      </label>

      <label className="block text-sm font-medium text-stone-700">
        Precio (€)
        <input
          className={inputClass}
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={dish?.price ?? ""}
          required
        />
      </label>

      <label className="block text-sm font-medium text-stone-700">
        Stock
        <input
          className={inputClass}
          name="stock"
          type="number"
          min="0"
          step="1"
          defaultValue={dish?.stock ?? 0}
        />
      </label>

      <label className="block text-sm font-medium text-stone-700 md:col-span-2">
        Imagen (URL)
        <input
          className={inputClass}
          name="imageUrl"
          type="url"
          defaultValue={dish?.image || ""}
          required
        />
      </label>

      <label className="block text-sm font-medium text-stone-700 md:col-span-2">
        Descripción
        <textarea
          className={`${inputClass} min-h-24`}
          name="description"
          defaultValue={dish?.description || ""}
          required
        />
      </label>

      <label className="block text-sm font-medium text-stone-700 md:col-span-2">
        Ingredientes (separados por coma)
        <input className={inputClass} name="ingredients" defaultValue={ingredientsValue} />
      </label>

      <label className="block text-sm font-medium text-stone-700 md:col-span-2">
        Alérgenos (separados por coma)
        <input
          className={inputClass}
          name="allergens"
          defaultValue={allergensValue}
          placeholder="Gluten, lácteos, pescado..."
        />
      </label>

      <label className="block text-sm font-medium text-stone-700 md:col-span-2">
        Fotos extra (una URL por línea)
        <textarea
          className={`${inputClass} min-h-20`}
          name="extraImages"
          defaultValue={extraImagesValue}
        />
      </label>

      <label className="block text-sm font-medium text-stone-700 md:col-span-2">
        Recomendación
        <textarea
          className={`${inputClass} min-h-20`}
          name="recommendation"
          defaultValue={dish?.recommendation || ""}
          placeholder="Con qué marida o qué pedir después"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-stone-700 md:col-span-2">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={dish ? dish.isAvailable : true}
          className="h-4 w-4 rounded border-stone-300 text-red-700 focus:ring-red-700"
        />
        Visible en la carta pública
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

import Link from "next/link";

export default function RelatedCatalogField({
  name,
  label,
  options = [],
  selectedIds = [],
  catalogHref,
  emptyText,
}) {
  const selected = new Set(selectedIds.map(String));

  return (
    <fieldset className="md:col-span-2">
      <legend className="text-sm font-medium text-stone-700">{label}</legend>
      <p className="mt-1 text-xs text-stone-500">
        Marca los que lleva este plato. Si falta uno, créalo en{" "}
        <Link href={catalogHref} className="font-medium text-red-700 hover:underline">
          su tabla
        </Link>
        .
      </p>

      {options.length ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              <input
                type="checkbox"
                name={name}
                value={option.id}
                defaultChecked={selected.has(String(option.id))}
                className="h-4 w-4 accent-red-800"
              />
              <span className="truncate">{option.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-stone-200 px-3 py-4 text-sm text-stone-500">
          {emptyText}
        </p>
      )}
    </fieldset>
  );
}

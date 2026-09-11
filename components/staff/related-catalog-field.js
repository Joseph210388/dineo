import StaffLink from "./staff-link";

export default function RelatedCatalogField({
  name,
  label,
  options = [],
  selectedIds = [],
  catalogHref,
  emptyText,
  dense = false,
}) {
  const selected = new Set(selectedIds.map(String));
  const gridClass = dense
    ? "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4"
    : "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2";

  return (
    <fieldset className="rounded-2xl border border-stone-300/70 bg-stone-100/80 p-3 sm:p-4">
      <legend className="px-1 text-sm font-semibold text-stone-800">{label}</legend>
      <p className="text-xs leading-relaxed text-stone-600">
        Marca los que lleva este plato. Si falta uno, créalo en{" "}
        <StaffLink href={catalogHref} className="font-medium text-red-800 hover:underline">
          su tabla
        </StaffLink>
        .
      </p>

      {options.length ? (
        <div className={gridClass}>
          {options.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300/70 bg-cream px-2.5 text-sm text-stone-700 transition hover:border-red-800/35 hover:bg-red-50/50 has-[:checked]:border-red-800/45 has-[:checked]:bg-red-50/70 ${
                dense ? "min-h-9 py-1.5" : "min-h-10 px-3 py-2"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={option.id}
                defaultChecked={selected.has(String(option.id))}
                className="h-4 w-4 shrink-0 accent-red-800"
              />
              <span className="truncate">{option.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-stone-300 bg-cream px-3 py-4 text-sm text-stone-500">
          {emptyText}
        </p>
      )}
    </fieldset>
  );
}

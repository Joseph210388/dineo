"use client";

import SearchInput from "../search-input/search-input";
import FilterChipList from "../filter-chip/filter-chip";
import CheckboxFilterGroup from "../checkbox-filter-group/checkbox-filter-group";
import { DISH_TYPES, countByCategory, countByType } from "../../lib/filter-dishes";

export default function FoodFilters({
  dishes,
  categoryOptions = [],
  query,
  categories,
  types,
  areOpen,
  onToggle,
  onQueryChange,
  onToggleCategory,
  onToggleType,
  onRemoveTag,
  onClear,
  tags,
}) {
  const typeOptions = DISH_TYPES.filter((item) => countByType(dishes, item.id) > 0).map((item) => ({
    id: item.id,
    label: item.label,
    count: countByType(dishes, item.id),
  }));

  const categoryFilterOptions = categoryOptions.map((item) => ({
    id: item,
    label: item,
    count: countByCategory(dishes, item),
  }));

  return (
    <aside className="w-full lg:max-w-[16.5rem] lg:shrink-0">
      <div className="rounded-2xl border border-red-900/10 bg-[#fffaf3] p-4 shadow-sm lg:sticky lg:top-24">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-red-800">La carta</p>
            <h2 className="mt-1 text-[clamp(1.1rem,2.4vw,1.3rem)] font-semibold text-stone-900">
              Cómo quieres pedir
            </h2>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 lg:hidden"
            aria-expanded={areOpen}
          >
            {areOpen ? "Cerrar" : `Filtros${tags.length ? ` (${tags.length})` : ""}`}
          </button>
        </div>

        <SearchInput
          value={query}
          onChange={onQueryChange}
          label="Buscar platos"
          placeholder="¿Ceviche, causa, lomo...?"
        />

        <div className="mt-3 lg:hidden">
          <FilterChipList tags={tags} onRemove={onRemoveTag} onClear={tags.length ? onClear : undefined} />
        </div>

        <div className={`${areOpen ? "mt-5 block" : "hidden"} space-y-5 lg:mt-5 lg:block`}>
          <CheckboxFilterGroup
            title="Categorías"
            options={categoryFilterOptions}
            selectedIds={categories}
            onToggle={onToggleCategory}
          />

          <CheckboxFilterGroup
            title="Tipo de plato"
            options={typeOptions}
            selectedIds={types}
            onToggle={onToggleType}
          />

          {tags.length ? (
            <button
              type="button"
              onClick={onClear}
              className="w-full rounded-2xl border border-red-800/20 px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-800 hover:text-white"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

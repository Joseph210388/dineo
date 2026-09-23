"use client";

import { DIETARY_OPTIONS } from "../../lib/reservation-preferences";

const noteClass =
  "mt-1.5 w-full resize-none rounded-xl border border-stone-300/80 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-red-700 focus:ring-4 focus:ring-red-700/15";

function ChipGroup({ legend, options, value, onChange, name }) {
  const selected = options.find((item) => item.id === value);

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-stone-800">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = value === option.id;
          return (
            <label
              key={option.id}
              title={option.hint}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                isActive
                  ? "border-red-800 bg-red-800 text-white"
                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={isActive}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {selected?.hint ? (
        <p className="mt-1.5 text-xs text-stone-500">{selected.hint}</p>
      ) : null}
    </fieldset>
  );
}

/**
 * Dietética en chips + nota libre para cocina.
 * La mesa física se elige en TablePicker.
 */
export default function PreferencePicker({
  dietaryNote,
  onDietaryNoteChange,
  kitchenNote = "",
  onKitchenNoteChange,
}) {
  return (
    <div className="space-y-4">
      <ChipGroup
        legend="Alérgenos / dietética"
        name="dietaryNote"
        options={DIETARY_OPTIONS}
        value={dietaryNote}
        onChange={onDietaryNoteChange}
      />
      <div>
        <label htmlFor="kitchenNote" className="text-sm font-semibold text-stone-800">
          Nota para cocina <span className="font-normal text-stone-400">(opcional)</span>
        </label>
        <textarea
          id="kitchenNote"
          value={kitchenNote}
          onChange={(event) => onKitchenNoteChange?.(event.target.value)}
          rows={2}
          maxLength={280}
          placeholder="Ej. sin sal, diabético, poco picante…"
          className={noteClass}
        />
        <p className="mt-1 text-[0.65rem] text-stone-400">
          {(kitchenNote || "").length}/280
        </p>
      </div>
    </div>
  );
}

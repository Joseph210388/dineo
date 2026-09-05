"use client";

import { useState } from "react";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";

export default function NamedListField({
  name,
  label,
  items = [],
  placeholder = "",
  hint = "",
}) {
  const [values, setValues] = useState(items);
  const [draft, setDraft] = useState("");

  function addItem() {
    const next = draft.trim();
    if (!next || values.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }

    setValues((current) => [...current, next]);
    setDraft("");
  }

  function removeItem(index) {
    setValues((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <fieldset className="block text-sm font-medium text-stone-700 md:col-span-2">
      <legend>{label}</legend>
      {hint ? <p className="mt-1 font-normal text-stone-500">{hint}</p> : null}

      <input type="hidden" name={name} value={values.join(", ")} />

      {values.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-800"
            >
              <span className="truncate">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-full p-0.5 hover:bg-red-100"
                aria-label={`Quitar ${item}`}
              >
                <HiOutlineX className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs font-normal text-stone-400">Todavía no hay ninguno. Añade el primero.</p>
      )}

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none ring-red-700/20 focus:border-red-700 focus:ring-4"
        />
        <button
          type="button"
          onClick={addItem}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Añadir
        </button>
      </div>
    </fieldset>
  );
}

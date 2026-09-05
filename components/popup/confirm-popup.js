"use client";

import Popup from "./popup";

export default function ConfirmPopup({
  isOpen,
  title,
  description,
  itemName,
  itemImage,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onCancel}
      showClose={false}
      closePosition="bar"
      maxWidthClass="max-w-md"
      zClass="z-[80]"
      panelClassName="px-5 py-6 sm:px-7 sm:py-7"
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-red-700">Confirmar</p>
      <h2 className="mt-2 text-[clamp(1.2rem,3vw,1.5rem)] font-semibold text-stone-900">{title}</h2>
      {description ? <p className="mt-2 text-sm text-stone-500">{description}</p> : null}

      {itemName ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-stone-50 p-3">
          {itemImage ? (
            <img src={itemImage} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          ) : null}
          <p className="min-w-0 truncate font-medium text-stone-800">{itemName}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          {confirmLabel}
        </button>
      </div>
    </Popup>
  );
}

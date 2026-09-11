"use client";

import { HiOutlineX } from "react-icons/hi";

const TONES = {
  transparent: "bg-transparent",
  cream: "bg-cream",
  stone: "bg-stone-100",
  light: "bg-white/95",
  // Rojo de la marca (panel Taipei / DINEO)
  brand: "bg-red-800 text-white",
};

const CLOSE_BTN = {
  transparent: "bg-stone-200/80 text-stone-800 hover:bg-stone-300/80",
  cream: "bg-cream text-stone-800 hover:bg-stone-200/70",
  stone: "bg-stone-200/90 text-stone-800 hover:bg-stone-300",
  light: "bg-white/95 text-stone-800 shadow-sm hover:bg-white",
  brand: "bg-white/15 text-white hover:bg-white/25",
};

const TITLE_CLASS = {
  transparent: "text-stone-900",
  cream: "text-stone-900",
  stone: "text-stone-900",
  light: "text-stone-900",
  brand: "text-white",
};

function CloseButton({ onClose, tone }) {
  const closeClass = CLOSE_BTN[tone] || CLOSE_BTN.transparent;
  return (
    <button
      type="button"
      onClick={onClose}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${closeClass}`}
      aria-label="Cerrar"
    >
      <HiOutlineX className="h-6 w-6" />
    </button>
  );
}

export default function PopupHeader({
  title = "",
  showClose = true,
  onClose,
  tone = "transparent",
  flush = false,
  className = "",
}) {
  const toneClass = TONES[tone] || TONES.transparent;
  const titleClass = TITLE_CLASS[tone] || TITLE_CLASS.transparent;
  const flushClass = flush
    ? "rounded-t-3xl px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8"
    : "";

  // Solo la X (p. ej. flotante sobre una foto o auth)
  if (!title && showClose) {
    return (
      <div className={`flex justify-end ${className}`.trim()}>
        <CloseButton onClose={onClose} tone={tone} />
      </div>
    );
  }

  if (!title && !showClose) {
    return null;
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-3 ${toneClass} ${flushClass} ${className}`.trim()}
    >
      {title ? (
        <h2
          className={`min-w-0 flex-1 truncate text-[clamp(1.15rem,2.6vw,1.55rem)] font-semibold leading-tight ${titleClass}`}
        >
          {title}
        </h2>
      ) : (
        <span className="min-w-0 flex-1" aria-hidden="true" />
      )}
      {showClose ? <CloseButton onClose={onClose} tone={tone} /> : null}
    </div>
  );
}

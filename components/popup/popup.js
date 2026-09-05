"use client";

import { useEffect } from "react";
import { HiOutlineX } from "react-icons/hi";

const CLOSE_TONES = {
  cream: "bg-cream text-stone-800",
  light: "bg-white/90 text-stone-800 shadow-sm",
};

export default function Popup({
  isOpen = true,
  onClose,
  children,
  showClose = true,
  closePosition = "bar",
  closeTone = "cream",
  maxWidthClass = "max-w-md",
  zClass = "z-[70]",
  panelClassName = "",
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function onKey(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const closeButton = showClose ? (
    <button
      type="button"
      onClick={onClose}
      className={`flex h-10 w-10 items-center justify-center rounded-full ${CLOSE_TONES[closeTone] || CLOSE_TONES.cream} ${
        closePosition === "overlay" ? "absolute right-3 top-3 z-20 sm:right-4 sm:top-4" : ""
      }`}
      aria-label="Cerrar"
    >
      <HiOutlineX className="h-6 w-6" />
    </button>
  ) : null;

  return (
    <div className={`fixed inset-0 ${zClass} flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-4`}>
      <button type="button" className="absolute inset-0" aria-label="Cerrar" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[94svh] w-full overflow-y-auto rounded-t-3xl bg-white text-stone-900 sm:rounded-3xl ${maxWidthClass} ${panelClassName}`}
      >
        {closePosition === "bar" && closeButton ? <div className="mb-3 flex justify-end">{closeButton}</div> : null}
        {closePosition === "overlay" ? closeButton : null}
        {children}
      </div>
    </div>
  );
}

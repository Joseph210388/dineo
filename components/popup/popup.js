"use client";

import { useEffect } from "react";
import PopupHeader from "./popup-header";

export default function Popup({
  isOpen = true,
  onClose,
  children,
  title = "",
  // transparent | cream | stone | light | brand
  headerTone = "transparent",
  showClose = true,
  // bar = cabecera arriba; overlay = X flotante (p. ej. sobre foto)
  closePosition = "bar",
  maxWidthClass = "max-w-md",
  zClass = "z-[70]",
  panelClassName = "",
  panelBgClass = "bg-white",
  overflowMode = "panel",
  listenEscape = true,
}) {
  useEffect(() => {
    if (!isOpen || !listenEscape) {
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
  }, [isOpen, onClose, listenEscape]);

  if (!isOpen) {
    return null;
  }

  const showBarHeader = closePosition === "bar" && (Boolean(title) || showClose);
  // El rojo de marca va a sangre (sin padding del panel alrededor)
  const headerFlush = headerTone === "brand";
  const overflowClass =
    overflowMode === "none"
      ? "flex flex-col overflow-hidden"
      : "overflow-y-auto thin-scrollbar";

  return (
    <div className={`fixed inset-0 ${zClass} flex items-end justify-center p-0 sm:items-center sm:p-4`}>
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/50 motion-reduce:animate-none animate-backdrop-in"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[94svh] w-full rounded-t-3xl text-stone-900 shadow-xl shadow-stone-900/15 motion-reduce:animate-none max-sm:animate-sheet-in sm:animate-sheet-in-desk sm:rounded-3xl ${panelBgClass} ${overflowClass} ${maxWidthClass} ${
          headerFlush ? "" : panelClassName
        }`}
      >
        {showBarHeader ? (
          <PopupHeader
            title={title}
            showClose={showClose}
            onClose={onClose}
            tone={headerTone}
            flush={headerFlush}
            className={headerFlush ? "" : "mb-3"}
          />
        ) : null}

        {closePosition === "overlay" && showClose ? (
          <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
            <PopupHeader
              title=""
              showClose
              onClose={onClose}
              tone={headerTone === "transparent" ? "light" : headerTone}
            />
          </div>
        ) : null}

        {headerFlush ? (
          <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${panelClassName}`}>{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

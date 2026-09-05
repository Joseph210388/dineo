"use client";

import { useEffect, useState } from "react";
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineX } from "react-icons/hi";
import { dismissToast, subscribeToasts } from "../../lib/toast";

const TONES = {
  success: {
    box: "border-emerald-200 bg-white text-stone-800",
    icon: "text-emerald-700",
    Icon: HiOutlineCheckCircle,
  },
  error: {
    box: "border-red-200 bg-white text-stone-800",
    icon: "text-red-700",
    Icon: HiOutlineExclamationCircle,
  },
  info: {
    box: "border-stone-200 bg-white text-stone-800",
    icon: "text-red-800",
    Icon: HiOutlineInformationCircle,
  },
};

export default function ToastViewport() {
  const [items, setItems] = useState([]);

  useEffect(() => subscribeToasts(setItems), []);

  if (!items.length) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col gap-2 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20 sm:w-[min(22rem,calc(100vw-2rem))]"
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((item) => {
        const tone = TONES[item.type] || TONES.success;
        const Icon = tone.Icon;

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-3 py-3 shadow-lg motion-reduce:animate-none max-sm:animate-toast-up sm:animate-toast-in ${tone.box}`}
            role="status"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.icon}`} aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm leading-snug">{item.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="shrink-0 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Cerrar aviso"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

const ICON_TONES = {
  light: "text-stone-500 hover:text-stone-800",
  dark: "text-stone-400 hover:text-white",
};

export default function PasswordInput({
  id,
  name = "password",
  className = "",
  autoComplete = "current-password",
  required,
  minLength,
  tabIndex,
  tone = "light",
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative mt-1">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        tabIndex={tabIndex}
        className={`w-full pr-12 ${className}`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((open) => !open)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 ${ICON_TONES[tone] || ICON_TONES.light}`}
        aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {isVisible ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
      </button>
    </div>
  );
}

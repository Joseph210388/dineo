"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CART_FLY_EVENT } from "../../lib/cart-events";

const FLY_MS = 650;

/**
 * Miniatura que vuela desde el botón “Añadir” hasta el icono del carrito.
 */
export default function CartFlyLayer() {
  const [flight, setFlight] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function onFly(event) {
      const { imageUrl, from } = event.detail || {};
      const target = document.querySelector("[data-cart-target]");
      if (!imageUrl || !from || !target) {
        return;
      }

      const to = target.getBoundingClientRect();
      const start = {
        x: from.x + from.w / 2 - 28,
        y: from.y + from.h / 2 - 28,
      };
      const end = {
        x: to.left + to.width / 2 - 14,
        y: to.top + to.height / 2 - 14,
      };

      setFlight({
        id: Date.now(),
        imageUrl,
        start,
        end,
      });

      target.classList.remove("animate-cart-pop");
      // Reinicia la animación del icono al llegar el plato
      window.setTimeout(() => {
        target.classList.add("animate-cart-pop");
      }, FLY_MS - 80);
    }

    window.addEventListener(CART_FLY_EVENT, onFly);
    return () => window.removeEventListener(CART_FLY_EVENT, onFly);
  }, []);

  useEffect(() => {
    if (!flight) {
      return undefined;
    }
    const timer = window.setTimeout(() => setFlight(null), FLY_MS + 40);
    return () => window.clearTimeout(timer);
  }, [flight]);

  if (!mounted || !flight) {
    return null;
  }

  const style = {
    "--fly-x": `${flight.end.x - flight.start.x}px`,
    "--fly-y": `${flight.end.y - flight.start.y}px`,
    left: `${flight.start.x}px`,
    top: `${flight.start.y}px`,
  };

  return createPortal(
    <img
      key={flight.id}
      src={flight.imageUrl}
      alt=""
      aria-hidden
      className="pointer-events-none fixed z-[90] h-14 w-14 rounded-xl object-cover shadow-lg animate-cart-fly motion-reduce:animate-none motion-reduce:opacity-0"
      style={style}
    />,
    document.body
  );
}

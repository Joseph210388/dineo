export const CART_CHANGED_EVENT = "taipei:cart-changed";
export const CART_FLY_EVENT = "taipei:cart-fly";

/** Avisa al icono del carrito (y a quien escuche) de que el contenido cambió. */
export function notifyCartChanged() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

/** Lanza la animación “el plato vuela al carrito”. */
export function notifyCartFly({ imageUrl, from }) {
  if (typeof window === "undefined" || !imageUrl || !from) {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(CART_FLY_EVENT, {
      detail: { imageUrl, from },
    })
  );
}

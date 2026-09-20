export const HEADER_DROPDOWN_EVENT = "taipei:header-dropdown";

/**
 * Avisa a los menús del header (carrito / usuario) de que uno se abrió,
 * para que el otro se cierre y no se solapen.
 */
export function notifyHeaderDropdown(source) {
  if (typeof window === "undefined" || !source) {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(HEADER_DROPDOWN_EVENT, {
      detail: { source },
    })
  );
}

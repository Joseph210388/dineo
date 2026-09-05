const TOAST_LIMIT = 4;
const DEFAULT_MS = 2800;

let toasts = [];
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function dismissToast(id) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

function pushToast({ type = "success", message, duration = DEFAULT_MS }) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  toasts = [...toasts, { id, type, message }].slice(-TOAST_LIMIT);
  emit();

  if (typeof window !== "undefined" && duration > 0) {
    window.setTimeout(() => dismissToast(id), duration);
  }

  return id;
}

export const toast = {
  success(message) {
    return pushToast({ type: "success", message });
  },
  error(message) {
    return pushToast({ type: "error", message });
  },
  info(message) {
    return pushToast({ type: "info", message });
  },
};

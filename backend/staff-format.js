export function formatMoney(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    typeof value === "string" && value.length <= 10
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(value) {
  return String(value || "").slice(0, 5);
}

export function reservationStatusLabel(status) {
  const labels = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
  };
  return labels[status] || status;
}

export function userRoleLabel(role) {
  const labels = {
    customer: "Cliente",
    employee: "Empleado",
    admin: "Admin",
  };
  return labels[role] || role;
}

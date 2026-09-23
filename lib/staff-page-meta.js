/**
 * Título y subtítulo del panel staff según la ruta.
 * La cabecera sticky los muestra; las páginas no los repiten.
 */
export function getStaffPageMeta(pathname) {
  const path = String(pathname || "");

  if (path === "/staff" || path === "/staff/") {
    return {
      title: "Resumen",
      subtitle: "Dinero de reservas confirmadas o completadas. Las pendientes no entran en la caja.",
    };
  }

  if (path.startsWith("/staff/dishes")) {
    return {
      title: "Carta",
      subtitle: "Edita en un popup. Relaciona ingredientes y alérgenos del catálogo.",
    };
  }

  if (path.startsWith("/staff/blog")) {
    return {
      title: "Blog",
      subtitle: "Noticias, promociones y platos destacados visibles en /blog.",
    };
  }

  if (path.startsWith("/staff/settings")) {
    return {
      title: "Configuración",
      subtitle:
        "Categorías, ingredientes y alérgenos en un solo sitio. Ábrelos en un popup para gestionarlos.",
    };
  }

  if (path.startsWith("/staff/reservations/")) {
    return {
      title: "Reserva",
      subtitle: "Detalle, estado y cobro de la mesa.",
    };
  }

  if (path.startsWith("/staff/reservations")) {
    return {
      title: "Reservas",
      subtitle: "Plano del día, mesas libres y lista. Crea con «Nueva reserva».",
    };
  }

  if (path.startsWith("/staff/users/")) {
    return {
      title: "Usuario",
      subtitle: "Datos, rol y actividad del cliente o del personal.",
    };
  }

  if (path.startsWith("/staff/users")) {
    return {
      title: "Usuarios",
      subtitle: "Clientes y personal. Solo administración puede editar roles.",
    };
  }

  return {
    title: "Panel",
    subtitle: "Gestión del local Taipei",
  };
}

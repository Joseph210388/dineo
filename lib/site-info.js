/** Datos de contacto y marca usados en footer, legales y contacto. */
export const SITE = {
  name: "Taipei",
  tagline: "Cocina peruana en Asturias. Lima, los Andes y el Pacífico en una misma mesa.",
  since: 1990,
  address: "C/ Geary Blvd 109",
  phone: "1-800-890-4567",
  mobile: "600-89-45-67",
  email: "example@gmail.com",
};

export function siteContactLine() {
  return `${SITE.email} · ${SITE.address} · Tel. ${SITE.phone}`;
}

export function siteSinceAddress() {
  return `Desde ${SITE.since} · ${SITE.address}`;
}

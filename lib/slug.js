/** Convierte un título en slug URL-safe (sin tildes ni espacios). */
export function slugify(input, { maxLength = 80 } = {}) {
  const base = String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");

  return base || "entrada";
}

export function uniqueSlug(title, idHint = "") {
  const base = slugify(title);
  const hint = String(idHint || "")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toLowerCase();
  return hint ? `${base}-${hint}` : base;
}

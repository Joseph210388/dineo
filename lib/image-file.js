/**
 * Comprime una imagen del disco a JPEG data-URL (demo sin Storage).
 * Limita tamaño para no hinchar Postgres.
 */
export async function fileToCompressedDataUrl(file, { maxSide = 1200, quality = 0.78, maxBytes = 900_000 } = {}) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Elige un archivo de imagen");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo leer la imagen");
    }
    context.drawImage(image, 0, 0, width, height);

    let currentQuality = quality;
    let dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
    while (dataUrl.length > maxBytes && currentQuality > 0.45) {
      currentQuality -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
    }

    if (dataUrl.length > maxBytes) {
      throw new Error("La imagen pesa demasiado. Usa otra más ligera o una URL.");
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo abrir esa imagen"));
    image.src = src;
  });
}

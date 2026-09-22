/**
 * Comprime una imagen del disco a JPEG (antes de subir a Storage).
 * Limita lado y peso para no saturar la subida.
 */

export async function fileToCompressedJpegFile(
  file,
  { maxSide = 1200, quality = 0.78, maxBytes = 900_000 } = {}
) {
  const blob = await fileToCompressedJpegBlob(file, { maxSide, quality, maxBytes });
  const baseName = String(file.name || "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w.-]+/g, "_")
    .slice(0, 40);
  return new File([blob], `${baseName || "image"}.jpg`, { type: "image/jpeg" });
}

/** @deprecated Preferir fileToCompressedJpegFile + upload a Storage */
export async function fileToCompressedDataUrl(file, options = {}) {
  const blob = await fileToCompressedJpegBlob(file, options);
  return blobToDataUrl(blob);
}

async function fileToCompressedJpegBlob(file, { maxSide = 1200, quality = 0.78, maxBytes = 900_000 } = {}) {
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
    let blob = await canvasToJpegBlob(canvas, currentQuality);
    while (blob.size > maxBytes && currentQuality > 0.45) {
      currentQuality -= 0.08;
      blob = await canvasToJpegBlob(canvas, currentQuality);
    }

    if (blob.size > maxBytes) {
      throw new Error("La imagen pesa demasiado. Usa otra más ligera o una URL.");
    }

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la imagen"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo abrir esa imagen"));
    image.src = src;
  });
}

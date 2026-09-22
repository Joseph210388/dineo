import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { SITE } from "./site-info";
import { paymentMethodLabel } from "./payment-methods";
import { dietaryLabel, tableTypeLabel } from "./reservation-preferences";

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function safeText(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

/**
 * Genera un comprobante/factura PDF de una reserva (demo portfolio, no factura fiscal AEAT).
 */
export async function buildReservationInvoicePdf(reservation) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const width = page.getWidth() - margin * 2;
  let y = page.getHeight() - margin;

  const draw = (text, { size = 11, bold = false, color = rgb(0.12, 0.12, 0.12), x = margin } = {}) => {
    page.drawText(String(text), {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  // Cabecera
  draw(SITE.name, { size: 22, bold: true, color: rgb(0.55, 0.05, 0.08) });
  y -= 18;
  draw("Comprobante de reserva", { size: 12, color: rgb(0.35, 0.35, 0.35) });
  y -= 14;
  draw(`${SITE.address} · ${SITE.city}`, { size: 9, color: rgb(0.4, 0.4, 0.4) });
  y -= 12;
  draw(`${SITE.email} · Tel. ${SITE.phone}`, { size: 9, color: rgb(0.4, 0.4, 0.4) });
  y -= 22;

  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + width, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 24;

  const code = String(reservation.id).padStart(4, "0");
  draw(`Reserva #${code}`, { size: 14, bold: true });
  y -= 18;
  draw(`Estado: ${safeText(reservation.statusLabel)}`);
  y -= 16;
  draw(`Titular: ${safeText(reservation.guestName)}`);
  y -= 16;
  draw(`Fecha: ${safeText(reservation.dateLabel)}  ·  Hora: ${safeText(reservation.timeLabel)}`);
  y -= 16;
  draw(`Personas: ${reservation.people}`);
  y -= 16;
  draw(`Mesa: ${safeText(reservation.tableLabel)}`);
  y -= 16;
  draw(`Dietética: ${safeText(reservation.dietaryLabel)}`);
  y -= 16;
  if (reservation.kitchenNote) {
    draw(`Nota cocina: ${reservation.kitchenNote}`);
    y -= 16;
  }
  draw(`Pago: ${safeText(reservation.paymentLabel)}`);
  y -= 28;

  draw("Desglose", { size: 13, bold: true });
  y -= 18;

  const items = reservation.items || [];
  if (!items.length) {
    draw("Sin platos registrados");
    y -= 16;
  } else {
    for (const item of items) {
      if (y < 100) break;
      const lineTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0);
      const left = `${item.quantity}× ${item.dishName}`;
      const right = money(lineTotal);
      draw(left.slice(0, 70));
      const rightWidth = font.widthOfTextAtSize(right, 11);
      page.drawText(right, {
        x: margin + width - rightWidth,
        y,
        size: 11,
        font,
        color: rgb(0.12, 0.12, 0.12),
      });
      y -= 16;
    }
  }

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + width, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 22;

  const total = money(reservation.total);
  draw("TOTAL", { size: 12, bold: true });
  const totalWidth = fontBold.widthOfTextAtSize(total, 14);
  page.drawText(total, {
    x: margin + width - totalWidth,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.55, 0.05, 0.08),
  });

  y = 64;
  draw(
    "Documento demostrativo para portfolio. No constituye factura fiscal.",
    { size: 8, color: rgb(0.5, 0.5, 0.5) }
  );
  y -= 12;
  draw(`Generado: ${new Date().toLocaleString("es-ES")}`, {
    size: 8,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdf.save();
}

export function buildInvoiceViewModel(reservation, { guestFallback = "Cliente" } = {}) {
  const notes = String(reservation.notes || "");
  const match = notes.match(/A nombre de:\s*([^·]+)/i);
  const guestName = match?.[1]?.trim() || guestFallback;

  const statusMap = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return {
    id: reservation.id,
    guestName,
    statusLabel: statusMap[reservation.status] || reservation.status,
    dateLabel: reservation.dateLabel,
    timeLabel: reservation.timeLabel,
    people: reservation.numberOfPeople,
    tableLabel: tableTypeLabel(reservation.tableType),
    dietaryLabel: dietaryLabel(reservation.dietaryNote),
    kitchenNote: reservation.kitchenNote || "",
    paymentLabel: paymentMethodLabel(reservation.paymentMethod),
    total: reservation.totalPrice,
    items: reservation.items || [],
  };
}

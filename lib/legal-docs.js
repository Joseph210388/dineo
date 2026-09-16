import { siteContactLine } from "./site-info";

export const LEGAL_UPDATED_AT = "16 de septiembre de 2026";

export const privacyDoc = {
  metaTitle: "Privacidad · Taipei",
  metaDescription: "Política de privacidad del restaurante Taipei.",
  title: "Política de privacidad",
  sections: [
    {
      title: "1. Quiénes somos",
      paragraphs: [
        "Taipei es un restaurante de cocina peruana. Tratamos tus datos para gestionar reservas, pedidos, cuenta de usuario y atención al cliente.",
      ],
    },
    {
      title: "2. Qué datos recogemos",
      paragraphs: ["Según el uso que hagas de la web, podemos tratar:"],
      bullets: [
        "Nombre, correo y teléfono.",
        "Datos de reserva (fecha, hora, personas y preferencias).",
        "Datos de cuenta si te registras (correo y contraseña cifrada).",
        "Datos técnicos básicos de navegación para que la web funcione.",
      ],
    },
    {
      title: "3. Para qué los usamos",
      bullets: [
        "Confirmar y gestionar reservas y pedidos.",
        "Responder a mensajes de contacto.",
        "Mantener tu cuenta y favoritos, si los usas.",
        "Cumplir obligaciones legales cuando aplique (facturación, reclamaciones).",
      ],
      paragraphs: ["No vendemos tus datos a terceros con fines comerciales."],
    },
    {
      title: "4. Conservación",
      paragraphs: [
        "Guardamos los datos el tiempo necesario para la reserva o el servicio, y el que exija la ley. Puedes pedir acceso, rectificación o borrado cuando corresponda.",
      ],
    },
    {
      title: "5. Tus derechos",
      paragraphs: [
        "Puedes solicitar información sobre tus datos, corregirlos o pedir su eliminación escribiendo a nuestro correo de contacto. Te responderemos en un plazo razonable.",
      ],
    },
    {
      title: "6. Contacto",
      paragraphs: [`Para privacidad: ${siteContactLine()}.`],
    },
  ],
};

export const termsDoc = {
  metaTitle: "Términos · Taipei",
  metaDescription: "Términos de uso y condiciones del restaurante Taipei.",
  title: "Términos y condiciones",
  sections: [
    {
      title: "1. Uso de la web",
      paragraphs: [
        "Al usar la web de Taipei aceptas estas condiciones. El contenido (carta, textos e imágenes) es orientativo y puede cambiar por disponibilidad o temporada.",
      ],
    },
    {
      title: "2. Reservas",
      bullets: [
        "La reserva queda sujeta a confirmación del restaurante.",
        "Indica el número real de comensales y avísanos si llegas con retraso.",
        "Si no puedes asistir, cancela con la mayor antelación posible para liberar la mesa.",
        "En caso de no presentación sin aviso, podremos limitar futuras reservas online.",
      ],
    },
    {
      title: "3. Carta, alérgenos y precios",
      paragraphs: [
        "Los precios se muestran en euros e incluyen, salvo indicación contraria, los impuestos aplicables. La carta puede variar. Si tienes alergias o intolerancias, indícalo al reservar o al personal; revisamos alérgenos, pero no podemos garantizar ausencia total de trazas.",
      ],
    },
    {
      title: "4. Pedidos y pagos",
      paragraphs: [
        "Los pedidos o reservas realizados desde la web son una solicitud. El cobro se gestiona según el método elegido (en local u otras formas disponibles). Los pagos con tarjeta o Bizum en demo pueden no ser cobros reales según la configuración del local.",
      ],
    },
    {
      title: "5. Cuentas de usuario",
      paragraphs: [
        "Eres responsable de mantener la confidencialidad de tu acceso. No uses la cuenta de otra persona ni realices usos abusivos de la plataforma.",
      ],
    },
    {
      title: "6. Limitación",
      paragraphs: [
        "Taipei no se responsabiliza de interrupciones de la web ajenas a nuestro control ni de daños derivados de un uso indebido del servicio.",
      ],
    },
    {
      title: "7. Contacto",
      paragraphs: [`Para dudas sobre estos términos: ${siteContactLine()}.`],
    },
  ],
};

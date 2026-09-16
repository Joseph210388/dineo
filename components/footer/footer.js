import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/icons/logo.png";
import { SITE, siteSinceAddress } from "../../lib/site-info";
import {
  FOOTER_ACCOUNT_LINKS,
  FOOTER_SOCIAL_LINKS,
  LEGAL_LINKS,
  MAIN_NAV_LINKS,
} from "../../lib/site-nav";

const COLUMNS = [
  { title: "Explorar", links: FOOTER_ACCOUNT_LINKS },
  { title: "Enlaces", links: MAIN_NAV_LINKS },
  { title: "Síguenos", links: FOOTER_SOCIAL_LINKS },
];

function FooterLink({ href, children }) {
  const className =
    "block text-sm text-stone-300 transition hover:text-white focus-visible:outline-none focus-visible:text-white";

  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-stone-950 text-stone-100">
      <section className="w-full border-b border-white/10 bg-red-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-8 lg:py-12">
          <h2 className="max-w-xl text-balance text-[clamp(1.6rem,4vw,2.75rem)] font-medium leading-tight text-cream">
            Reserva y celebra
          </h2>

          <form
            action="/contact"
            method="get"
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="footer-email">
              Correo para novedades
            </label>
            <div className="flex min-w-0 flex-1 items-center rounded-xl border border-cream/35 bg-transparent focus-within:border-cream">
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                placeholder="Tu correo"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/55"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-3 text-sm font-semibold text-cream transition hover:text-white"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-8 lg:px-8">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src={Logo} width={40} height={40} className="h-10 w-10 object-contain" alt={`Logo de ${SITE.name}`} />
            <span className="text-xl font-semibold tracking-wide text-white">{SITE.name}</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-stone-400">{SITE.tagline}</p>
          <p className="mt-4 text-sm font-medium text-cream">{siteSinceAddress()}</p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((item) => (
                <li key={`${column.title}-${item.href}-${item.label}`}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="w-full border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year}{" "}
            <Link href="/" className="text-stone-400 transition hover:text-cream">
              {SITE.name}
            </Link>
            . Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap gap-5">
            {LEGAL_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-cream">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { LEGAL_UPDATED_AT } from "../../lib/legal-docs";
import { SITE } from "../../lib/site-info";

function SectionBody({ section }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-stone-900 sm:text-lg">{section.title}</h2>
      <div className="mt-2 space-y-3">
        {(section.paragraphs || []).map((text) => (
          <p key={text.slice(0, 48)}>{text}</p>
        ))}
        {section.bullets?.length ? (
          <ul className="list-disc space-y-1 pl-5">
            {section.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default function LegalDoc({ doc }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-800">{SITE.name}</p>
      <h1 className="mt-2 text-[clamp(1.6rem,4vw,2.4rem)] font-medium text-stone-900">{doc.title}</h1>
      <p className="mt-2 text-sm text-stone-500">Última actualización: {LEGAL_UPDATED_AT}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-700 sm:text-base">
        {doc.sections.map((section) => (
          <SectionBody key={section.title} section={section} />
        ))}
      </div>

      <p className="mt-10 text-sm text-stone-500">
        ¿Dudas?{" "}
        <Link href="/contact" className="font-medium text-red-800 underline-offset-2 hover:underline">
          Contáctanos
        </Link>
        .
      </p>
    </main>
  );
}

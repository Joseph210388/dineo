import Image from "next/image";
import Link from "next/link";
import { FiMail, FiMapPin, FiPhone, FiSmartphone } from "react-icons/fi";
import Logo from "../public/icons/logo.png";

const contactDetails = [
  {
    icon: FiMapPin,
    label: "Dirección",
    value: "C/ Geary Blvd 109",
    href: "https://maps.google.com/?q=Geary+Blvd+109",
  },
  {
    icon: FiPhone,
    label: "Teléfono",
    value: "1-600-890-4567",
    href: "tel:16008904567",
  },
  {
    icon: FiSmartphone,
    label: "Celular",
    value: "600-89-45-67",
    href: "tel:600894567",
  },
  {
    icon: FiMail,
    label: "Correo",
    value: "example@gmail.com",
    href: "mailto:example@gmail.com",
  },
];

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-8 bg-red-700 sm:w-12"></span>
      <span className="h-1 w-1 rotate-45 bg-red-700"></span>
      <span className="h-px w-8 bg-red-700 sm:w-12"></span>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden text-white">
        <div className="absolute inset-0">
          <video
            src="https://videos.pexels.com/video-files/2894881/2894881-uhd_3840_2160_24fps.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          ></video>
          {/* Degradado para que el texto se lea sin aplanar la imagen */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80"></div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <Image
            src={Logo}
            width={56}
            height={64}
            alt="Logo de Taipei"
            className="mb-6 h-auto w-12 sm:mb-8 sm:w-14"
          />
          <p className="mb-4 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-red-500 sm:text-xs">
            Restaurante peruano
          </p>
          <h1
            className="text-balance text-[clamp(1.75rem,6vw,3.75rem)] font-medium leading-tight text-white"
          >
            Explosión de sabores de Perú
          </h1>
          <div className="mt-6">
            <Ornament />
          </div>
          <h2
            className="mt-6 text-[clamp(1.25rem,3vw,1.75rem)] text-white"
          >
            Delicia Peruana
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-200 sm:text-base">
            Sabor a la tradición. Una mesa para celebrar la cocina de Lima, los Andes y el Pacífico.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Link
              href="/food"
              className="rounded-full bg-red-800 px-8 py-3 text-center text-sm font-semibold tracking-wide text-white transition duration-300 hover:bg-white hover:text-stone-900 sm:text-base"
            >
              Haz tu reserva
            </Link>
            <Link
              href="#historia"
              className="rounded-full border border-white/70 px-8 py-3 text-center text-sm font-semibold tracking-wide text-white transition duration-300 hover:bg-white hover:text-stone-900 sm:text-base"
            >
              Nuestra historia
            </Link>
          </div>
        </div>
      </section>

      <section
        id="historia"
        className="bg-cream px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div
              className="absolute -inset-3 hidden border border-red-700/50 lg:block"
              aria-hidden="true"
            ></div>
            <img
              src="https://images.pexels.com/photos/6937464/pexels-photo-6937464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Plato de cocina peruana servido en mesa"
              className="relative z-10 aspect-[4/5] w-full max-w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
            />
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-red-800 sm:text-xs">
              Desde 1990
            </p>
            <h2
              className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-stone-900"
            >
              El alma de una mesa peruana
            </h2>
            <div className="mt-4">
              <Ornament />
            </div>
            <p className="mt-6 text-sm leading-relaxed text-stone-600 sm:text-base">
              En Taipei abrimos las puertas para compartir la Delicia Peruana: ceviches, causas, ajíes y recetas que viajan de la costa al altiplano. Nos apasiona llevar a la mesa los sabores y las tradiciones de Perú, con el mismo respeto con el que se cocinan en casa.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
              Nuestro equipo de chefs fusiona técnicas contemporáneas con recetas auténticas. El resultado es una experiencia cálida, elegante y generosa: cocina de raíz, servida con calma.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-red-800 transition hover:text-red-600"
            >
              Conoce más sobre nosotros
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-stone-900 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-8">
          <article>
            <p className="text-3xl text-red-500 sm:text-4xl">1990</p>
            <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-200">
              Tradición
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-400">
              Más de tres décadas cuidando recetas familiares y el ritual de la mesa peruana.
            </p>
          </article>
          <article>
            <p className="text-3xl text-red-500 sm:text-4xl">Cocina</p>
            <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-200">
              De autor
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-400">
              Chefs que honran el ceviche, el ají y la causa con técnica de hoy.
            </p>
          </article>
          <article>
            <p className="text-3xl text-red-500 sm:text-4xl">Mesa</p>
            <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-200">
              Hospitalidad
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-400">
              Un ambiente sereno para celebrar, compartir y quedarse un rato más.
            </p>
          </article>
        </div>
      </section>

      <section
        id="contacto"
        className="bg-cream px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-red-800 sm:text-xs">
              Estamos cerca
            </p>
            <h2
              className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] text-stone-900"
            >
              Cómo contactar
            </h2>
            <div className="mt-4">
              <Ornament />
            </div>
            <p className="mt-6 text-sm leading-relaxed text-stone-600 sm:text-base">
              Reserva tu mesa, pregunta por el menú del día o escríbenos. Te atendemos con el mismo cuidado con el que servimos cada plato.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactDetails.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center rounded-sm border border-stone-200 bg-white px-5 py-8 text-center transition hover:border-red-800/40 hover:shadow-sm"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-800 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-stone-900">{item.value}</p>
                </a>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/contact"
              className="w-full rounded-full bg-red-800 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
            >
              Escribirnos
            </Link>
            <Link
              href="/food"
              className="w-full rounded-full border border-red-700 px-8 py-3 text-center text-sm font-semibold text-red-800 transition hover:bg-red-700 hover:text-white sm:w-auto"
            >
              Ver la carta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

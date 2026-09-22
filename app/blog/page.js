import Link from "next/link";
import { listPublishedPosts } from "../../backend/actions/blog";
import { formatDate } from "../../backend/staff-format";
import { postKindLabel } from "../../lib/blog";
import { SITE } from "../../lib/site-info";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Blog · ${SITE.name}`,
  description: `Noticias, promociones y novedades de ${SITE.name}.`,
};

export default async function BlogPage() {
  const posts = await listPublishedPosts({ limit: 30 });

  return (
    <main className="bg-cream min-h-[calc(100svh-8rem)] px-[4%] py-10 sm:py-12 md:px-[6%] lg:px-[8%]">
      <header className="mx-auto w-full max-w-5xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-800/80">
          Del local
        </p>
        <h1 className="mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold text-stone-900">
          Blog de {SITE.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600 sm:text-base">
          Noticias, platos de temporada, eventos y promociones publicados por el equipo.
        </p>
      </header>

      <div className="mx-auto mt-8 w-full max-w-5xl">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-12 text-center text-sm text-stone-500">
            Aún no hay entradas publicadas. Vuelve pronto.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm shadow-stone-900/5 transition hover:border-red-800/40"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt=""
                        className="h-full w-full max-w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-xs font-semibold uppercase tracking-wide text-stone-400">
                        {SITE.name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-red-900">
                        {postKindLabel(post.kind)}
                      </span>
                      <span className="text-xs text-stone-500">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold leading-snug text-stone-900 group-hover:text-red-900">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-stone-600">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

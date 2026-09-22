import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug, listPublishedPosts } from "../../../backend/actions/blog";
import { formatDate } from "../../../backend/staff-format";
import { postKindLabel } from "../../../lib/blog";
import { SITE } from "../../../lib/site-info";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: `Entrada · ${SITE.name}` };
  }
  return {
    title: `${post.title} · ${SITE.name}`,
    description: post.excerpt || post.title,
  };
}

function bodyParagraphs(body) {
  return String(body || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const related = (await listPublishedPosts({ limit: 4 })).filter((item) => item.id !== post.id).slice(0, 3);
  const paragraphs = bodyParagraphs(post.body);

  return (
    <main className="bg-cream min-h-[calc(100svh-8rem)] px-[4%] py-10 sm:py-12 md:px-[6%] lg:px-[8%]">
      <article className="mx-auto w-full max-w-3xl">
        <Link href="/blog" className="text-sm font-medium text-red-800 hover:underline">
          ← Volver al blog
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-red-900">
              {postKindLabel(post.kind)}
            </span>
            <span className="text-xs text-stone-500">
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            {post.authorName ? (
              <span className="text-xs text-stone-500">· {post.authorName}</span>
            ) : null}
          </div>
          <h1 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight text-stone-900">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">{post.excerpt}</p>
          ) : null}
        </header>

        {post.coverImageUrl ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
            <img
              src={post.coverImageUrl}
              alt=""
              className="aspect-[16/9] w-full max-w-full object-cover"
            />
          </div>
        ) : null}

        <div className="mt-8 space-y-4 text-base leading-relaxed text-stone-800 sm:text-[1.05rem]">
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
          ))}
        </div>
      </article>

      {related.length ? (
        <section className="mx-auto mt-14 w-full max-w-3xl border-t border-stone-200 pt-8">
          <h2 className="text-lg font-semibold text-stone-900">También te puede interesar</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="block rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-800 transition hover:border-red-800/40 hover:text-red-900"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

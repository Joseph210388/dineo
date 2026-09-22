"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createPostAction,
  deletePostAction,
  updatePostAction,
} from "../../backend/actions/blog";
import { formatDate } from "../../backend/staff-format";
import { postKindLabel, postStatusLabel } from "../../lib/blog";
import { matchesSearch, TABLE_PAGE_SIZE } from "../../lib/search-text";
import { usePaginator } from "../../lib/use-paginator";
import SearchInput from "../search-input/search-input";
import Pagination from "../pagination/pagination";
import Popup from "../popup/popup";
import ConfirmPopup from "../popup/confirm-popup";
import BlogPostForm from "./blog-post-form";

export default function BlogBoard({ posts }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(
    () => posts.filter((post) => matchesSearch(`${post.title} ${post.kind} ${post.status}`, query)),
    [posts, query]
  );
  const page = usePaginator(filtered, TABLE_PAGE_SIZE);

  function closeEditor() {
    setEditing(null);
    setCreating(false);
    setError("");
    setToDelete(null);
  }

  async function handleSave(formData) {
    setSaving(true);
    setError("");
    const result = editing
      ? await updatePostAction(formData)
      : await createPostAction(formData);
    setSaving(false);
    if (!result.ok) {
      setError(result.error || "No se pudo guardar");
      return;
    }
    closeEditor();
    router.refresh();
  }

  async function handleDelete(id) {
    const data = new FormData();
    data.set("id", id);
    const result = await deletePostAction(data);
    if (result.ok) {
      closeEditor();
      router.refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href="/blog"
          target="_blank"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Ver blog público
        </Link>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
            setError("");
          }}
          className="inline-flex rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nueva entrada
        </button>
      </div>

      {posts.length > 0 ? (
        <div className="mt-6 max-w-xl">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Buscar entrada"
            placeholder="Título, tipo o estado"
          />
          <p className="mt-2 text-sm text-stone-500">
            {page.total} coinciden · página {page.page} de {page.totalPages}
          </p>
        </div>
      ) : null}

      {posts.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          Aún no hay entradas. Publica la primera noticia o promoción.
        </p>
      ) : page.total === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          Nada coincide con la búsqueda.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {page.visible.map((post) => (
                <tr key={post.id} className="hover:bg-stone-50/80">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setEditing(post);
                        setError("");
                      }}
                      className="text-left font-medium text-stone-900 hover:text-red-900"
                    >
                      {post.title}
                    </button>
                    {post.excerpt ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{post.excerpt}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{postKindLabel(post.kind)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {postStatusLabel(post.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {formatDate(post.publishedAt || post.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setEditing(post);
                        setError("");
                      }}
                      className="text-xs font-semibold text-red-800 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-stone-100 px-4 py-3">
            <Pagination
              page={page.page}
              totalPages={page.totalPages}
              total={page.total}
              pageSize={page.pageSize}
              onPageChange={page.setPage}
            />
          </div>
        </div>
      )}

      <Popup
        isOpen={creating || Boolean(editing)}
        onClose={closeEditor}
        title={editing ? "Editar entrada" : "Nueva entrada"}
        showClose
        closePosition="bar"
        headerTone="brand"
        maxWidthClass="max-w-[min(56rem,96vw)]"
        panelBgClass="bg-cream"
        overflowMode="none"
        panelClassName="px-4 pb-5 pt-4 sm:px-6 sm:pb-6"
        zClass="z-[75]"
        listenEscape={!toDelete}
      >
        <BlogPostForm
          key={editing?.id || "new"}
          post={editing}
          saving={saving}
          error={error}
          onCancel={closeEditor}
          onSubmit={handleSave}
        />
        {editing ? (
          <div className="mt-2 flex justify-start border-t border-stone-200 pt-3">
            <button
              type="button"
              onClick={() => setToDelete(editing)}
              className="text-sm font-medium text-red-800 hover:underline"
            >
              Eliminar entrada
            </button>
          </div>
        ) : null}
      </Popup>

      <ConfirmPopup
        isOpen={Boolean(toDelete)}
        onCancel={() => setToDelete(null)}
        title="¿Eliminar esta entrada?"
        description="Esta acción no se puede deshacer."
        itemName={toDelete?.title}
        itemImage={toDelete?.coverImageUrl || undefined}
        confirmLabel="Eliminar"
        onConfirm={() => handleDelete(toDelete.id)}
      />
    </div>
  );
}

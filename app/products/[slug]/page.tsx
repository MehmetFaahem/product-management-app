"use client";

import Header from "@/components/Header";
import {
  useDeleteProductMutation,
  useGetProductBySlugQuery,
} from "@/services/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetProductBySlugQuery(params.slug);
  const [del, { isLoading: deleting }] = useDeleteProductMutation();
  const [confirming, setConfirming] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  return (
    <div>
      <Header />
      <main className="container py-6">
        {isLoading && (
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-[color-mix(in_oklab,var(--c-primary)_/_12%,transparent)] to-transparent h-2" />
            <div className="card-body">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden skeleton" />
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    <div className="h-16 rounded-lg skeleton" />
                    <div className="h-16 rounded-lg skeleton" />
                    <div className="h-16 rounded-lg skeleton" />
                    <div className="h-16 rounded-lg skeleton" />
                    <div className="h-16 rounded-lg skeleton" />
                  </div>
                </div>
                <div>
                  <div className="h-8 w-2/3 skeleton mb-3" />
                  <div className="h-5 w-24 skeleton mb-4" />
                  <div className="h-24 w-full skeleton mb-6" />
                  <div className="h-10 w-40 skeleton" />
                </div>
              </div>
            </div>
          </div>
        )}
        {error && <p className="error">Failed to load product.</p>}
        {data && (
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-[color-mix(in_oklab,var(--c-primary)_/_12%,transparent)] to-transparent h-1.5" />
            <div className="card-body">
              <nav className="text-sm mb-4 flex items-center gap-2 text-[color-mix(in_oklab,var(--c-fg)_/_70%,white)]">
                <Link href="/products" className="hover:underline">
                  Products
                </Link>
                <span>/</span>
                <span className="truncate" title={data.name}>
                  {data.name}
                </span>
              </nav>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  {data.images?.length ? (
                    <>
                      {/* Main image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          data.images[
                            Math.min(activeImageIndex, data.images.length - 1)
                          ]
                        }
                        alt={data.name}
                        className="w-full aspect-[4/3] md:aspect-square object-cover rounded-xl border"
                        loading="lazy"
                      />
                      {/* Thumbnails */}
                      {data.images.length > 1 && (
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {data.images
                            .slice(0, 5)
                            .map((src: string, idx: number) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={src + idx}
                                src={src}
                                alt={data.name + " thumbnail " + (idx + 1)}
                                className={`h-16 w-full object-cover rounded-lg border cursor-pointer ${
                                  idx === activeImageIndex
                                    ? "ring-2 ring-[color:var(--c-primary)]"
                                    : "opacity-80 hover:opacity-100"
                                }`}
                                onClick={() => setActiveImageIndex(idx)}
                                loading="lazy"
                              />
                            ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="aspect-[4/3] md:aspect-square rounded-xl border grid place-items-center text-[color-mix(in_oklab,var(--c-fg)_/_60%,white)]">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1
                        className="card-title text-2xl md:text-3xl"
                        style={{ color: "var(--c-primary)" }}
                      >
                        {data.name}
                      </h1>
                      <div className="mt-2 flex items-center gap-3">
                        {data.category?.name && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border bg-[color-mix(in_oklab,var(--c-primary)_/_8%,transparent)]">
                            {data.category.name}
                          </span>
                        )}
                        <span className="text-xs text-[color-mix(in_oklab,var(--c-fg)_/_60%,white)]">
                          SKU: {data.slug}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/products/${data.slug}/edit`}
                        className="btn btn-ghost"
                      >
                        <Pencil size={16} /> Edit
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => setConfirming(true)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>

                  <div
                    className="text-xl font-semibold"
                    style={{ color: "var(--c-fg)" }}
                  >
                    {priceFormatter.format(Number(data.price ?? 0))}
                  </div>

                  {data.description && (
                    <p className="text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)] leading-7">
                      {data.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delete confirmation modal */}
            {confirming && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
                <div className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 shadow-xl border">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold">Delete product</h2>
                  </div>
                  <div className="p-4 text-sm text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)]">
                    Are you sure you want to delete{" "}
                    <span
                      className="font-medium"
                      style={{ color: "var(--c-fg)" }}
                    >
                      {data.name}
                    </span>
                    ? This action cannot be undone.
                  </div>
                  <div className="p-4 pt-0 flex items-center justify-end gap-2">
                    <button
                      className="btn btn-ghost"
                      onClick={() => setConfirming(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={deleting}
                      onClick={async () => {
                        await del(data.id).unwrap();
                        router.push("/products");
                      }}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

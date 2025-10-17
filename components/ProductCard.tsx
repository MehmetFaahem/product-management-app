"use client";

import Link from "next/link";
import { Product } from "@/services/api";
import { Trash2, Pencil } from "lucide-react";
import { useState } from "react";

export default function ProductCard({
  product,
  onRequestDelete,
}: {
  product: Product;
  onRequestDelete?: (product: Product) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="card overflow-hidden transition-transform duration-150 hover:-translate-y-[2px]">
      <Link href={`/products/${product.slug}`} className="block group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            product?.images?.length > 0
              ? product?.images[0]
              : "https://placehold.co/400"
          }
          alt={product?.name}
          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </Link>

      <div className="card-body">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            href={`/products/${product.slug}`}
            className="card-title text-lg hover:underline"
          >
            {product.name.slice(0, 20)}...
          </Link>
          <div className="flex gap-2">
            <Link
              className="btn btn-ghost"
              href={`/products/${product.slug}/edit`}
              aria-label="Edit"
            >
              <Pencil size={16} />
            </Link>
            <button
              className="btn btn-danger"
              onClick={() =>
                onRequestDelete ? onRequestDelete(product) : setConfirming(true)
              }
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <p className="text-sm text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)] mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 2,
            }).format(Number(product.price ?? 0))}
          </span>
          {product.category?.id && (
            <Link
              href={`/products?categoryId=${encodeURIComponent(
                product.category.id
              )}`}
              className="inline-flex items-center px-2 py-1 rounded-full border text-xs bg-[color-mix(in_oklab,var(--c-primary)_/_8%,transparent)] hover:bg-[color-mix(in_oklab,var(--c-primary)_/_14%,transparent)] transition-colors"
              title={`Filter by ${product.category.name}`}
            >
              {product.category.name}
            </Link>
          )}
        </div>
      </div>
      {/* Fallback inline modal if no parent handler is provided */}
      {confirming && !onRequestDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white  shadow-xl border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Delete product</h2>
            </div>
            <div className="p-4 text-sm text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)]">
              Are you sure you want to delete{" "}
              <span className="font-medium" style={{ color: "var(--c-fg)" }}>
                {product.name}
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
                onClick={() => setConfirming(false)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

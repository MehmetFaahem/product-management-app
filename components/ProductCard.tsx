"use client";

import Link from "next/link";
import { Product, useDeleteProductMutation } from "@/services/api";
import { Trash2, Pencil } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const [confirming, setConfirming] = useState(false);
  const [del, { isLoading }] = useDeleteProductMutation();

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            href={`/products/${product.slug}`}
            className="card-title text-lg hover:underline"
          >
            {product.name}
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
              onClick={() => setConfirming(true)}
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
          <span className="font-semibold">${product.price}</span>
          <span className="text-[color-mix(in_oklab,var(--c-fg)_/_70%,white)]">
            {product.category?.name}
          </span>
        </div>
      </div>
      {confirming && (
        <div className="p-3 border-t flex items-center justify-between">
          <span>Delete this product?</span>
          <div className="flex gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={isLoading}
              onClick={async () => {
                await del(product.id).unwrap();
                setConfirming(false);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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

  return (
    <div>
      <Header />
      <main className="container py-6">
        {isLoading && <p>Loading...</p>}
        {error && <p className="error">Failed to load product.</p>}
        {data && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <h1
                  className="card-title text-2xl"
                  style={{ color: "var(--c-primary)" }}
                >
                  {data.name}
                </h1>
                <div className="flex gap-2">
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
              <p className="text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)] mb-2">
                {data.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">${data.price}</span>
                <span>{data.category?.name}</span>
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
                    disabled={deleting}
                    onClick={async () => {
                      await del(data.id).unwrap();
                      router.push("/products");
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

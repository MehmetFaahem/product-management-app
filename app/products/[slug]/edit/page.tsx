"use client";

import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";
import { useGetProductBySlugQuery } from "@/services/api";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading, error } = useGetProductBySlugQuery(params.slug);
  return (
    <div>
      <Header />
      <main className="container py-6">
        <div className="max-w-2xl mx-auto card overflow-hidden">
          <div className="bg-gradient-to-r from-[color-mix(in_oklab,var(--c-primary)_/_12%,transparent)] to-transparent h-1.5" />
          <div className="card-body">
            <h1
              className="card-title text-2xl mb-4"
              style={{ color: "var(--c-primary)" }}
            >
              Edit product
            </h1>
            {isLoading && <p>Loading...</p>}
            {error && <p className="error">Failed to load product.</p>}
            {data && <ProductForm product={data} />}
          </div>
        </div>
      </main>
    </div>
  );
}

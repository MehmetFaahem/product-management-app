"use client";

import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
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
              Create product
            </h1>
            <ProductForm />
          </div>
        </div>
      </main>
    </div>
  );
}

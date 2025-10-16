"use client";

import Header from "@/components/Header";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <Header />
      <main className="container py-6">
        <div className="max-w-2xl mx-auto card">
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

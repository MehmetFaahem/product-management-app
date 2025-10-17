"use client";

import Header from "@/components/Header";
import Products from "@/components/Products";

export default function ProductsPage() {
  return (
    <div>
      <Header />
      <main className="container pb-6">
        <Products />
      </main>
    </div>
  );
}

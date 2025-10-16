"use client";
import Header from "@/components/Header";
import Products from "@/components/Products";
import { useAppSelector } from "@/lib/store";
import Link from "next/link";

export default function Home() {
  const { token } = useAppSelector((s) => s.auth);
  return (
    <div>
      <Header />
      <main className="container py-16">
        <section className="max-w-3xl">
          <h1
            className="text-4xl font-extrabold mb-4"
            style={{ color: "var(--c-primary)" }}
          >
            Build and manage your product catalog beautifully
          </h1>
          <p className="text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)] mb-8 text-lg">
            Search, create, and edit products with a polished, responsive
            experience.
          </p>
          <div className="flex gap-2">
            <Link href="/products" className="btn btn-primary">
              Browse Products
            </Link>
            {!token && (
              <Link href="/login" className="btn btn-ghost">
                Login
              </Link>
            )}
          </div>
        </section>
        <Products />
      </main>
    </div>
  );
}

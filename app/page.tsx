import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="container py-10">
        <div className="max-w-xl">
          <h1
            className="text-3xl font-extrabold mb-3"
            style={{ color: "var(--c-primary)" }}
          >
            Welcome
          </h1>
          <p className="text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)] mb-6">
            Browse, create, edit, and manage products with a clean, responsive
            UI.
          </p>
          <div className="flex gap-2">
            <Link href="/products" className="btn btn-primary">
              Browse Products
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { logout } from "@/features/auth/authSlice";
import { LogOut, Plus, ShoppingBag, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { token, email } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="border-b border-[color-mix(in_oklab,var(--c-fg)_/_12%,transparent)] sticky top-0 z-40 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl"
          style={{ color: "var(--c-primary)" }}
          onClick={closeMobile}
        >
          <ShoppingBag size={22} /> BiteX Products
        </Link>

        {/* Desktop navigation (custom CSS) */}
        <nav className="nav-desktop items-center gap-2">
          {token ? (
            <>
              <Link className="btn btn-ghost" href="/products">
                Browse
              </Link>
              <Link className="btn btn-primary" href="/products/new">
                <Plus size={16} /> New
              </Link>
              <button className="btn btn-ghost" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
              <span className="text-sm font-bold bg-[var(--c-primary)] text-white rounded-full w-12 h-12 flex items-center justify-center">
                {email?.slice(0, 3).toUpperCase()}
              </span>
            </>
          ) : (
            <Link className="btn btn-primary" href="/login">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile toggle button (custom CSS) */}
        <button
          type="button"
          className="nav-mobile-toggle btn btn-ghost"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu panel (custom CSS) */}
      <div
        id="mobile-menu"
        className={
          mobileOpen
            ? "nav-mobile-panel open border-t border-[color-mix(in_oklab,var(--c-fg)_/_12%,transparent)] bg-white/90"
            : "nav-mobile-panel border-t border-[color-mix(in_oklab,var(--c-fg)_/_12%,transparent)] bg-white/90"
        }
      >
        <div className="container py-2 flex flex-col gap-2">
          <Link
            className="btn btn-ghost"
            href="/products"
            onClick={closeMobile}
          >
            Browse
          </Link>
          {token ? (
            <>
              <Link
                className="btn btn-primary"
                href="/products/new"
                onClick={closeMobile}
              >
                <Plus size={16} /> New
              </Link>
              <button className="btn btn-ghost" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
              <span className="px-1 text-sm text-[color-mix(in_oklab,var(--c-fg)_/_70%,white)] text-center">
                {email}
              </span>
            </>
          ) : (
            <Link
              className="btn btn-primary"
              href="/login"
              onClick={closeMobile}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

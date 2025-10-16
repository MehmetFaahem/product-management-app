"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { logout } from "@/features/auth/authSlice";
import { LogOut, Plus, ShoppingBag } from "lucide-react";

export default function Header() {
  const { token, email } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  return (
    <header className="border-b border-[color-mix(in_oklab,var(--c-fg)_/_12%,transparent)] sticky top-0 z-40 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl"
          style={{ color: "var(--c-primary)" }}
        >
          <ShoppingBag size={22} /> BiteX Products
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="btn btn-ghost" href="/products">
            Browse
          </Link>
          {token ? (
            <>
              <Link className="btn btn-primary" href="/products/new">
                <Plus size={16} /> New
              </Link>
              <button
                className="btn btn-ghost"
                onClick={() => dispatch(logout())}
              >
                <LogOut size={16} /> Logout
              </button>
              <span className="text-sm text-[color-mix(in_oklab,var(--c-fg)_/_70%,white)]">
                {email}
              </span>
            </>
          ) : (
            <Link className="btn btn-primary" href="/login">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

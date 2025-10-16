"use client";

import ProductCard from "@/components/ProductCard";
import {
  useGetProductsQuery,
  useLazySearchProductsQuery,
} from "@/services/api";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/lib/store";

export default function Products() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(12);
  const offset = page * limit;
  const {
    data: products,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery({ offset, limit });
  const { token } = useAppSelector((state) => state.auth);
  const [trigger, { data: searchData, isFetching: searching }] =
    useLazySearchProductsQuery();
  const [q, setQ] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      if (q.trim().length > 0) trigger({ searchedText: q });
    }, 300);
    return () => clearTimeout(id);
  }, [q, trigger]);

  const list = useMemo(
    () => (q.trim() ? searchData : products) || [],
    [q, searchData, products]
  );

  return (
    <div>
      <main className="py-6">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div className="w-[80%] max-w-md">
            <label className="label">Search</label>
            <div className="relative">
              <input
                className="input pr-10"
                placeholder="Search products"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[color-mix(in_oklab,var(--c-fg)_/_60%,white)]">
                {searching ? "…" : list.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="label">Per page</label>
            <select
              className="input w-auto"
              value={limit}
              onChange={(e) => {
                setPage(0);
                setLimit(Number(e.target.value));
              }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>

        {(isLoading || isFetching || searching) && (
          <div className="grid-list">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="card">
                <div className="h-44 skeleton" />
                <div className="card-body">
                  <div className="h-5 w-1/2 skeleton mb-2" />
                  <div className="h-3 w-full skeleton mb-2" />
                  <div className="h-3 w-2/3 skeleton" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && list.length === 0 && (
          <div className="card">
            <div className="card-body text-center">
              <p className="mb-2">
                {token
                  ? "No products found."
                  : "Please login to view products."}
              </p>
              <p className="text-sm text-[color-mix(in_oklab,var(--c-fg)_/_70%,white)]">
                {token
                  ? "Try adjusting your search or filters."
                  : "Please login !!"}
              </p>
            </div>
          </div>
        )}
        {!isLoading && list.length > 0 && (
          <div className="grid-list">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            className="btn btn-ghost"
            disabled={page === 0}
            onClick={() => setPage((v) => Math.max(0, v - 1))}
          >
            Previous
          </button>
          <span className="text-sm">Page {page + 1}</span>
          <button
            className="btn btn-ghost"
            disabled={(products?.length || 0) < limit}
            onClick={() => {
              setPage((v) => v + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}

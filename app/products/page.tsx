"use client";

import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import {
  useGetProductsQuery,
  useLazySearchProductsQuery,
} from "@/services/api";
import { useEffect, useMemo, useState } from "react";

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(12);
  const offset = page * limit;
  const {
    data: products,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery({ offset, limit });
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
      <Header />
      <main className="container py-6">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div className="w-full max-w-md">
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Search products"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
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

        {(isLoading || isFetching || searching) && <p>Loading...</p>}
        {!isLoading && list.length === 0 && <p>No products found.</p>}
        <div className="grid-list">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

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
            onClick={() => setPage((v) => v + 1)}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}

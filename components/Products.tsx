"use client";

import ProductCard from "@/components/ProductCard";
import {
  useGetProductsQuery,
  useLazySearchProductsQuery,
  useGetCategoriesQuery,
  useDeleteProductMutation,
  type Product,
} from "@/services/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/lib/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Products() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(12);
  const offset = page * limit;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId") || "";
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const {
    data: products,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery({
    offset,
    limit,
    categoryId: initialCategoryId || undefined,
  });
  const { token } = useAppSelector((state) => state.auth);
  const [trigger, { data: searchData, isFetching: searching }] =
    useLazySearchProductsQuery();
  const [q, setQ] = useState("");
  const { data: categories } = useGetCategoriesQuery();
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice);
  const [sort, setSort] = useState<string>(initialSort);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<Product | null>(
    null
  );
  const [del, { isLoading: deleting }] = useDeleteProductMutation();
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      if (q.trim().length > 0) trigger({ searchedText: q });
    }, 300);
    return () => clearTimeout(id);
  }, [q, trigger]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) params.set("categoryId", categoryId);
    else params.delete("categoryId");
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    if (sort && sort !== "newest") params.set("sort", sort);
    else params.delete("sort");
    router.replace(`${pathname}?${params.toString()}`);
    setPage(0);
  }, [categoryId, minPrice, maxPrice, sort]);

  // Keyboard shortcut: focus search with '/'
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const list = useMemo((): Product[] => {
    const base: Product[] = (q.trim() ? searchData : products) || [];
    const byCategory: Product[] = !categoryId
      ? base
      : base.filter((p: Product) => p.category.id === categoryId);
    const byDeletion: Product[] = removedIds.size
      ? byCategory.filter((p: Product) => !removedIds.has(p.id))
      : byCategory;
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const byPrice: Product[] = byDeletion.filter((p: Product) => {
      const price = Number(p.price ?? 0);
      if (minPrice && !Number.isNaN(min) && price < min) return false;
      if (maxPrice && !Number.isNaN(max) && price > max) return false;
      return true;
    });
    const sorted: Product[] = [...byPrice];
    switch (sort) {
      case "price_asc":
        sorted.sort(
          (a: Product, b: Product) => Number(a.price) - Number(b.price)
        );
        break;
      case "price_desc":
        sorted.sort(
          (a: Product, b: Product) => Number(b.price) - Number(a.price)
        );
        break;
      case "name_asc":
        sorted.sort((a: Product, b: Product) =>
          String(a.name).localeCompare(String(b.name))
        );
        break;
      case "newest":
      default:
        sorted.sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
    return sorted;
  }, [
    q,
    searchData,
    products,
    categoryId,
    removedIds,
    minPrice,
    maxPrice,
    sort,
  ]);

  return (
    <div>
      <main className="py-6">
        <div className="flex items-end justify-between gap-3 mb-4 lg:flex-wrap">
          <div className="w-[100%] flex items-end justify-between gap-3">
            <div className="w-[100%] lg:w-[40%]">
              <label className="label">Search</label>
              <div className="relative">
                <input
                  className="input pr-16"
                  placeholder="Search products"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  ref={searchInputRef}
                />
                {q && (
                  <button
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-[color-mix(in_oklab,var(--c-fg)_/_70%,white)] hover:text-[color:var(--c-fg)] transition-colors"
                    onClick={() => setQ("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[color-mix(in_oklab,var(--c-fg)_/_60%,white)]">
                  {searching ? "…" : list.length}
                </span>
              </div>
            </div>
            <div className="items-end gap-3 hidden lg:flex">
              <div className="flex items-center gap-2">
                <label className="label">Category</label>
                <select
                  className="input w-auto max-w-xs"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">All</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="label">Price</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className="input w-24"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-sm">-</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className="input w-24"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Mobile: Filters button */}
          <div className="flex items-center justify-end w-[20%] lg:hidden mt-2">
            <button
              className="btn btn-ghost"
              onClick={() => setFiltersOpen(true)}
            >
              Filters
            </button>
          </div>
          {/* Desktop: filters row */}
          <div className="hidden lg:flex items-end justify-between lg:justify-end w-full gap-3">
            <div className="flex items-center gap-2">
              <label className="label">Sort</label>
              <select
                className="input w-auto"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
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
            {(categoryId || q || minPrice || maxPrice || sort !== "newest") && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setCategoryId("");
                  setQ("");
                  setMinPrice("");
                  setMaxPrice("");
                  setSort("newest");
                }}
              >
                Reset
              </button>
            )}
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
              <ProductCard
                key={p.id}
                product={p}
                onRequestDelete={(prod) => setSelectedForDelete(prod)}
              />
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

        {selectedForDelete && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white  shadow-xl border">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Delete product</h2>
              </div>
              <div className="p-4 text-sm text-[color-mix(in_oklab,var(--c-fg)_/_80%,white)]">
                Are you sure you want to delete{" "}
                <span className="font-medium" style={{ color: "var(--c-fg)" }}>
                  {selectedForDelete.name}
                </span>
                ? This action cannot be undone.
              </div>
              <div className="p-4 pt-0 flex items-center justify-end gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => setSelectedForDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  disabled={deleting}
                  onClick={async () => {
                    const id = selectedForDelete.id;
                    setRemovedIds((prev) => new Set(prev).add(id));
                    setSelectedForDelete(null);
                    try {
                      await del(id).unwrap();
                    } catch (e) {
                      setRemovedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      });
                    }
                  }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filters Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white border-l shadow-xl p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="card-title text-base">Filters</h3>
                <button
                  className="btn btn-ghost"
                  onClick={() => setFiltersOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">All</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Price range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="input w-1/2"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-sm">-</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="input w-1/2"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Sort</label>
                  <select
                    className="input"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>
                <div>
                  <label className="label">Per page</label>
                  <select
                    className="input"
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
                {(categoryId ||
                  q ||
                  minPrice ||
                  maxPrice ||
                  sort !== "newest") && (
                  <button
                    className="btn btn-ghost w-full"
                    onClick={() => {
                      setCategoryId("");
                      setQ("");
                      setMinPrice("");
                      setMaxPrice("");
                      setSort("newest");
                    }}
                  >
                    Reset filters
                  </button>
                )}
                <button
                  className="btn btn-primary w-full"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

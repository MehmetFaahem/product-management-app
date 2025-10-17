"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store";

const BASE_URL = "https://api.bitechx.com";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface CreateProductInput {
  name: string;
  description: string;
  images: string[];
  price: number;
  categoryId: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  images?: string[];
  price?: number;
  categoryId?: string;
}

export interface AuthResponse {
  token: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Products", "Product", "Categories"],
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string }>({
      query: (body) => ({ url: "/auth", method: "POST", body }),
    }),
    getProducts: build.query<
      Product[],
      { offset?: number; limit?: number; categoryId?: string } | void
    >({
      query: (params) => ({ url: "/products", params: params || {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Product" as const, id: p.id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    searchProducts: build.query<Product[], { searchedText: string }>({
      query: (params) => ({ url: "/products/search", params }),
      providesTags: [{ type: "Products", id: "SEARCH" }],
    }),
    getProductBySlug: build.query<Product, string>({
      query: (slug) => ({ url: `/products/${slug}` }),
      providesTags: (result) =>
        result ? [{ type: "Product", id: result.id }] : [],
    }),
    createProduct: build.mutation<Product, CreateProductInput>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [
        { type: "Products", id: "LIST" },
        { type: "Products", id: "SEARCH" },
      ],
    }),
    updateProduct: build.mutation<
      Product,
      { id: string; body: UpdateProductInput }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (r) =>
        r
          ? [
              { type: "Product", id: r.id },
              { type: "Products", id: "LIST" },
              { type: "Products", id: "SEARCH" },
            ]
          : [
              { type: "Products", id: "LIST" },
              { type: "Products", id: "SEARCH" },
            ],
    }),
    deleteProduct: build.mutation<Product, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Products", id: "LIST" },
        { type: "Products", id: "SEARCH" },
      ],
    }),
    getCategories: build.query<
      Category[],
      { offset?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/categories", params: params || {} }),
      providesTags: [{ type: "Categories", id: "LIST" }],
    }),
    searchCategories: build.query<Category[], { searchedText: string }>({
      query: (params) => ({ url: "/categories/search", params }),
      providesTags: [{ type: "Categories", id: "SEARCH" }],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProductsQuery,
  useLazySearchProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useLazySearchCategoriesQuery,
} = api;

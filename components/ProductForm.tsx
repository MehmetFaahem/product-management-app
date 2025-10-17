"use client";

import { useFieldArray, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Category,
  CreateProductInput,
  Product,
  UpdateProductInput,
  useCreateProductMutation,
  useGetCategoriesQuery,
  useUpdateProductMutation,
} from "@/services/api";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  images: z
    .array(z.object({ url: z.string().url("Image must be a valid URL") }))
    .min(1, "At least one image is required"),
  categoryId: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof schema>;

export default function ProductForm({ product }: { product?: Product }) {
  const isEdit = Boolean(product);
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [preview, setPreview] = useState<string | null>(
    product?.images?.[0] || null
  );

  const defaultValues: FormValues = useMemo(
    () => ({
      name: product?.name || "",
      description: product?.description || "",
      price: typeof product?.price === "number" ? product.price : 0,
      images:
        product?.images?.length && product.images[0]
          ? product.images.map((u) => ({ url: u }))
          : [],
      categoryId: product?.category?.id || "",
    }),
    [product]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray<FormValues, "images">({
    control,
    name: "images",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingCount, setUploadingCount] = useState<number>(0);

  const imagesWatch = watch("images");
  const imageUrls = Array.isArray(imagesWatch)
    ? imagesWatch
        .map((i) => (i && typeof i.url === "string" ? i.url : ""))
        .filter((u) => Boolean(u && u.trim()))
    : [];
  const mainPreview = preview || imageUrls[0] || null;

  async function uploadToCloudinary(file: File): Promise<string> {
    const signRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!signRes.ok) throw new Error("Failed to get signature");
    const { signature, timestamp, apiKey, cloudName, folder } =
      await signRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    if (folder) formData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!uploadRes.ok) throw new Error("Upload failed");
    const data = await uploadRes.json();
    const url: string | undefined = data.secure_url || data.url;
    if (!url) throw new Error("No URL returned from Cloudinary");
    return url;
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingCount((c) => c + files.length);
    try {
      for (const file of Array.from(files)) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const url = await uploadToCloudinary(file);
          append({ url });
          if (!preview) setPreview(url);
        } finally {
          setUploadingCount((c) => Math.max(0, c - 1));
        }
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const images = (values.images || [])
        .map((i) => i?.url)
        .filter((u): u is string => Boolean(u));
      if (isEdit && product) {
        const body: UpdateProductInput = {
          name: values.name,
          description: values.description,
          price: values.price,
          images,
          categoryId: values.categoryId,
        };
        await updateProduct({ id: product.id, body }).unwrap();
        router.push(`/products`);
      } else {
        const body: CreateProductInput = {
          name: values.name,
          description: values.description,
          price: values.price,
          images,
          categoryId: values.categoryId,
        };
        const created = await createProduct(body).unwrap();
        router.push(`/products/${created.slug}`);
      }
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mainPreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mainPreview}
          alt="Preview"
          className="w-full h-56 md:h-64 object-cover rounded-xl border"
        />
      )}
      <div>
        <label className="label">Name</label>
        <input className="input" {...register("name")} />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={4} {...register("description")} />
        {errors.description && (
          <p className="error">{errors.description.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Price</label>
          <input
            className="input"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && <p className="error">{errors.price.message}</p>}
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" {...register("categoryId")}>
            <option value="">Select a category</option>
            {categories?.map((c: Category) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="error">{errors.categoryId.message}</p>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Images</label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingCount > 0
                ? `Uploading (${uploadingCount})...`
                : "Add images"}
            </button>
          </div>
        </div>
        {errors.images && (
          <p className="error">
            {(errors.images as unknown as { message?: string })?.message}
          </p>
        )}
        {Array.isArray(errors.images) &&
          errors.images.map((err, i) =>
            err?.message ? (
              <p key={i} className="error">
                {err.message as string}
              </p>
            ) : null
          )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {imageUrls.map((src: string, idx: number) => (
          <div key={src + idx} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={"preview thumbnail " + (idx + 1)}
              className={`h-16 w-full object-cover rounded-lg border cursor-pointer ${
                mainPreview && src === mainPreview
                  ? "ring-2 ring-[color:var(--c-primary)]"
                  : "opacity-80 hover:opacity-100"
              }`}
              onClick={() => setPreview(src)}
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                const remaining = imageUrls.filter((_, i) => i !== idx);
                const nextPreview = remaining[0] || null;
                setPreview(nextPreview);
                remove(idx);
              }}
              title="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="h-16 w-full border border-dashed rounded-lg flex flex-col items-center justify-center text-sm text-gray-500 hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
          title="Add images"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="mt-1 text-[8px] md:text-sm">
            {uploadingCount > 0
              ? `Uploading (${uploadingCount})...`
              : "Add images"}
          </span>
        </button>
      </div>
      <button className="btn btn-primary" disabled={creating || updating}>
        {isEdit
          ? updating
            ? "Saving..."
            : "Save changes"
          : creating
          ? "Creating..."
          : "Create product"}
      </button>
    </form>
  );
}

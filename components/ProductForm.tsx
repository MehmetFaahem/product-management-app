"use client";

import { useForm } from "react-hook-form";
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
import { useMemo } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  image: z.string().url("Image must be a valid URL"),
  categoryId: z.string().min(1, "Category is required"),
});

type FormValues = z.input<typeof schema>;

export default function ProductForm({ product }: { product?: Product }) {
  const isEdit = Boolean(product);
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const defaultValues: FormValues = useMemo(
    () => ({
      name: product?.name || "",
      description: product?.description || "",
      price: (product?.price as unknown as string) || "",
      image: product?.images?.[0] || "https://i.imgur.com/QkIa5tT.jpeg",
      categoryId: product?.category?.id || "",
    }),
    [product]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && product) {
        const body: UpdateProductInput = {
          name: values.name,
          description: values.description,
          price: Number(values.price as unknown as string),
          images: [values.image],
          categoryId: values.categoryId,
        };
        await updateProduct({ id: product.id, body }).unwrap();
        router.push(`/products/${product.slug}`);
      } else {
        const body: CreateProductInput = {
          name: values.name,
          description: values.description,
          price: Number(values.price as unknown as string),
          images: [values.image],
          categoryId: values.categoryId,
        };
        const created = await createProduct(body).unwrap();
        router.push(`/products/${created.slug}`);
      }
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {...register("price")}
          />
          {errors.price && <p className="error">{errors.price.message}</p>}
        </div>
        <div>
          <label className="label">Image URL</label>
          <input className="input" {...register("image")} />
          {errors.image && <p className="error">{errors.image.message}</p>}
        </div>
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

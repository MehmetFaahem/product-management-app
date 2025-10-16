"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/services/api";
import { useAppDispatch } from "@/lib/store";
import { setCredentials } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login({ email: values.email }).unwrap();
      dispatch(setCredentials({ token: res.token, email: values.email }));
      router.push("/products");
    } catch (_) {}
  };

  return (
    <div>
      <div className="container py-10">
        <div className="max-w-md mx-auto card">
          <div className="card-body">
            <h1
              className="card-title text-2xl mb-4"
              style={{ color: "var(--c-primary)" }}
            >
              Login
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="error">{errors.email.message}</p>
                )}
              </div>
              <button className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              {error && (
                <p className="error">Failed to sign in. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

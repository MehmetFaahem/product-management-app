"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/services/api";
import { useAppDispatch } from "@/lib/store";
import { setCredentials } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

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
      <Header />
      <div className="container py-16">
        <div className="max-w-md mx-auto card">
          <div className="card-body">
            <h1
              className="card-title text-2xl mb-4"
              style={{ color: "var(--c-primary)" }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-[color-mix(in_oklab,var(--c-fg)_/_70%,white)] mb-4">
              Sign in with your email to continue.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
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
                <p className="error">
                  Failed to sign in. Please enter a valid email.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

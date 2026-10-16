"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DemoCredentials,
  type DemoAccount,
} from "@/components/auth/demo-credentials";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { useAuth } from "@/store/auth";
import { errorMessage } from "@/lib/api";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

export function LoginForm({ next }: { next: string | null }) {
  const { login, finishAuth } = useAuthActions();
  const notice = useAuth((state) => state.notice);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      finishAuth(user, next);
    } catch (error) {
      const message = errorMessage(error);
      if (message.toLowerCase().includes("password")) {
        setError("password", { message });
      } else if (message.toLowerCase().includes("email")) {
        setError("email", { message });
      } else {
        setError("root", { message });
      }
      toast.error(message);
    }
  };

  const fillDemo = (account: DemoAccount) => {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
    toast.info(`${account.role} demo credentials filled in`);
  };

  return (
    <div>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your requests, listings or moderation queue.
        </p>
      </div>

      {(notice || errors.root) && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {notice ?? errors.root?.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="size-4" /> Sign in
            </>
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-muted-foreground">testing</span>
        <Separator className="flex-1" />
      </div>

      <DemoCredentials onSelect={fillDemo} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to RentPlace?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary hover:underline"
        >
          Create an account <ArrowRight className="inline size-3.5" />
        </Link>
      </p>
    </div>
  );
}


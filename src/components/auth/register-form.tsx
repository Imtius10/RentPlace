"use client";

import Link from "next/link";
import { useState } from "react";
import { useWatch, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Home, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

const ROLE_OPTIONS = [
  {
    value: "TENANT",
    icon: Users,
    title: "I want to rent",
    text: "Browse homes, send requests and pay online.",
  },
  {
    value: "LANDLORD",
    icon: Home,
    title: "I want to list",
    text: "Publish properties and approve tenants.",
  },
] as const;

interface RegisterFormProps {
  next: string | null;
  initialRole: "TENANT" | "LANDLORD";
}

export function RegisterForm({ next, initialRole }: RegisterFormProps) {
  const { register: registerUser, finishAuth } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: initialRole,
      terms: false,
    },
  });

  const selectedRole = useWatch({ control, name: "role" });
  const termsAccepted = useWatch({ control, name: "terms" });

  const onSubmit = async (values: RegisterInput) => {
    try {
      const user = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      toast.success(`Account created — welcome, ${user.name.split(" ")[0]}!`);
      finishAuth(user, next);
    } catch (error) {
      const message = errorMessage(error);
      if (message.toLowerCase().includes("email")) {
        setError("email", { message });
      } else if (message.toLowerCase().includes("password")) {
        setError("password", { message });
      } else {
        setError("root", { message });
      }
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a role — the dashboard adapts to it instantly.
        </p>
      </div>

      {errors.root && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {errors.root.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-4"
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Join as</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((option) => {
              const active = selectedRole === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue("role", option.value, { shouldValidate: true })
                  }
                  className={cn(
                    "rounded-2xl border p-3 text-left transition-all",
                    active
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-border/70 bg-card hover:border-primary/40"
                  )}
                >
                  <option.icon
                    className={cn(
                      "size-4",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <p className="mt-2 text-sm font-semibold">{option.title}</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {option.text}
                  </p>
                </button>
              );
            })}
          </div>
          <FieldError message={errors.role?.message} />
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Jane Rahman"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 chars"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="terms"
            checked={Boolean(termsAccepted)}
            onCheckedChange={(checked) =>
              setValue("terms", checked === true, { shouldValidate: true })
            }
          />
          <label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
            I agree to RentPlace&apos;s terms and understand my role determines
            what I can do in the dashboard.
          </label>
        </div>
        <FieldError message={errors.terms?.message} />

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account…
            </>
          ) : (
            <>
              <UserPlus className="size-4" /> Create account
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in <ArrowRight className="inline size-3.5" />
        </Link>
      </p>
    </div>
  );
}


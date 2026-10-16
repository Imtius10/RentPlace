import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Tell us your name (min 2 characters)"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
    role: z.enum(["TENANT", "LANDLORD"], {
      errorMap: () => ({ message: "Pick how you'll use RentPlace" }),
    }),
    terms: z
      .boolean()
      .refine((value) => value === true, {
        message: "Please accept the terms to continue",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

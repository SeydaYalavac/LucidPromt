import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address.");
export const passwordSchema = z.string().min(8, "Use at least eight characters.");
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  displayName: z.string().trim().max(80, "Keep your display name under 80 characters."),
}).refine((value) => value.password === value.confirmPassword, { message: "The passwords don’t match.", path: ["confirmPassword"] });

export const signinSchema = z.object({ email: emailSchema, password: passwordSchema });

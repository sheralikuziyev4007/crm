import { z } from "zod";
import { LIMITS } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  password: z.string().min(LIMITS.passwordMin, `Password must be at least ${LIMITS.passwordMin} characters`),
});

export type LoginValues = z.infer<typeof loginSchema>;

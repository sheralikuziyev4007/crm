import { z } from "zod";
import { LIMITS } from "@/lib/constants";
import { isValidPhone, normalizePhone, PHONE_HINT } from "@/lib/phone";
import { STATUS_KEYS } from "./constants";

// One schema for the form (React Hook Form) and for the API (MSW handlers): the rules cannot drift apart.
export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LIMITS.nameMin, `Name must be at least ${LIMITS.nameMin} characters`)
    .max(LIMITS.nameMax, `Name must be at most ${LIMITS.nameMax} characters`),
  company: z
    .string()
    .trim()
    .max(LIMITS.companyMax, `Company must be at most ${LIMITS.companyMax} characters`),
  email: z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .refine(isValidPhone, PHONE_HINT)
    .transform(normalizePhone),
  status: z.enum(STATUS_KEYS, { message: "Choose a status" }),
});

export type ClientFormValues = z.input<typeof clientSchema>;
export type ClientFormOutput = z.output<typeof clientSchema>;

/** PATCH accepts any subset of the fields */
export const clientPatchSchema = clientSchema.partial();

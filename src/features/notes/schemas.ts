import { z } from "zod";
import { LIMITS } from "@/lib/constants";

export const noteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something first")
    .max(LIMITS.noteMax, `Notes can be at most ${LIMITS.noteMax} characters`),
});

export type NoteValues = z.infer<typeof noteSchema>;

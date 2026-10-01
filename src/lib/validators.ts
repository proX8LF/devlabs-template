import { z } from "zod";

export const itemSchema = z.object({
  title: z.string().trim().min(3, "Title needs at least 3 characters").max(140),
  details: z.string().trim().min(10, "Details need at least 10 characters").max(5000),
  status: z.enum(["open", "done"]).default("open"),
});

export type ItemDTO = z.infer<typeof itemSchema>;

export const settingsSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().or(z.literal("")),
  footerText: z.string().trim().max(300),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = issue.path.join(".") || "_";
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

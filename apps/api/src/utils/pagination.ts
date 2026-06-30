import { z } from "zod";

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sort: z.string().trim().optional(),
  order: z.enum(["asc", "desc"]).default("asc")
});

export function offset(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}

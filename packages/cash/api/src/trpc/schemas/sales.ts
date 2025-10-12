import z from "zod";

export const ZListSalesInputSchema = z.object({
  clientName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(10),
  sort: z.string().optional(),
});

export type TListSalesInputSchema = z.infer<typeof ZListSalesInputSchema>;

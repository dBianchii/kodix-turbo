import { z } from "zod";

export const ZCreateVoucherInputSchema = z.object({
  clientId: z.string(),
  purchaseTotal: z.number().positive("Valor da compra deve ser positivo"),
  redemptionAmount: z.number().positive("Valor do resgate deve ser positivo"),
});
export type TCreateVoucherInputSchema = z.infer<typeof ZCreateVoucherInputSchema>;

export const ZListVouchersInputSchema = z.object({
  clientId: z.string(),
});
export type TListVouchersInputSchema = z.infer<typeof ZListVouchersInputSchema>;

export const ZGetVoucherByIdInputSchema = z.object({
  voucherId: z.string(),
});
export type TGetVoucherByIdInputSchema = z.infer<typeof ZGetVoucherByIdInputSchema>;

import { z } from "zod";

export const ZDoCheckoutForShiftInput = z.date().default(new Date());
export type TDoCheckoutForShiftInput = z.infer<typeof ZDoCheckoutForShiftInput>;

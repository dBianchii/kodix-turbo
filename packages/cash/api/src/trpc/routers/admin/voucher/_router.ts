import type { TRPCRouterRecord } from "@trpc/server";

import { adminProcedure } from "../../../procedures";
import {
  ZCreateVoucherInputSchema,
  ZGetVoucherByIdInputSchema,
  ZListVouchersInputSchema,
} from "../../../schemas/voucher";
import { createVoucherHandler } from "./create.handler";
import { getVoucherByIdHandler } from "./getById.handler";
import { listVouchersHandler } from "./list.handler";

export const voucherRouter = {
  create: adminProcedure
    .input(ZCreateVoucherInputSchema)
    .mutation(createVoucherHandler),
  getById: adminProcedure
    .input(ZGetVoucherByIdInputSchema)
    .query(getVoucherByIdHandler),
  list: adminProcedure
    .input(ZListVouchersInputSchema)
    .query(listVouchersHandler),
} satisfies TRPCRouterRecord;

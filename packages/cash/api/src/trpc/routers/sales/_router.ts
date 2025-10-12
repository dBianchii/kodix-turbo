import type { TRPCRouterRecord } from "@trpc/server";

import { protectedProcedure } from "../../procedures";
import { ZListSalesInputSchema } from "../../schemas/sales";
import { listSalesHandler } from "./listSales.handler";

export const salesRouter = {
  list: protectedProcedure.input(ZListSalesInputSchema).query(listSalesHandler),
} satisfies TRPCRouterRecord;

import type z from "zod";
import { db } from "@cash/db/client";
import { vouchers } from "@cash/db/schema";
import { desc, eq } from "drizzle-orm";

import type { TAdminProcedureContext } from "../../../procedures";
import type { ZListVouchersInputSchema } from "../../../schemas/voucher";

interface ListVouchersHandlerOptions {
  ctx: TAdminProcedureContext;
  input: z.infer<typeof ZListVouchersInputSchema>;
}

export const listVouchersHandler = ({ input }: ListVouchersHandlerOptions) => {
  const { clientId } = input;

  return db.query.vouchers.findMany({
    columns: {
      codeNumber: true,
      createdAt: true,
      id: true,
      purchaseTotal: true,
    },
    orderBy: desc(vouchers.createdAt),
    where: eq(vouchers.clientId, clientId),
    with: {
      CreatedByUser: {
        columns: {
          name: true,
        },
      },
      VoucherCashbacks: {
        columns: {
          amount: true,
        },
      },
    },
  });
};

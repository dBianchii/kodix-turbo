"use server";

import { revalidatePath } from "next/cache";
import { adminAction, trpcCaller } from "@cash/api/trpc/react/server";
import { ZCreateVoucherInputSchema } from "@cash/api/trpc/schemas/voucher";

export const createVoucherAction = adminAction
  .input(ZCreateVoucherInputSchema)
  .mutation(async ({ input }) => {
    const result = await trpcCaller.admin.voucher.create(input);
    revalidatePath(`/admin/clients/${input.clientId}`);
    return result;
  });

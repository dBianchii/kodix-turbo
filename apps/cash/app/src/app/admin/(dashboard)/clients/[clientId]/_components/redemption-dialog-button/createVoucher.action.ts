"use server";

import { revalidatePath } from "next/cache";
import { trpcCaller } from "@cash/api/trpc/react/server";

export async function createVoucherAction(input: {
  clientId: string;
  purchaseTotal: number;
  redemptionAmount: number;
}) {
  const result = await trpcCaller.admin.voucher.create(input);
  revalidatePath(`/admin/clients/${input.clientId}`);
  return result;
}

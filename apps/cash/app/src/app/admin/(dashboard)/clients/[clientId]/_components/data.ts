import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { trpcCaller } from "@cash/api/trpc/react/server";
import { auth } from "@cash/auth";
import { ZNanoId } from "@kodix/shared/utils";

export const getClientData = cache(async (clientId: string) => {
  const session = await auth();
  if (!session.user?.isAdmin) {
    redirect("/admin/auth/login");
  }

  if (!ZNanoId.safeParse(clientId).success) {
    redirect("/admin/clients");
  }

  const data = await trpcCaller.admin.client.getById({ clientId });

  if (!data) redirect("/admin/clients");

  const { client, sales: rawSales } = data;

  const sales = rawSales.map((sale) => {
    const cashbackOriginal = sale.Cashbacks.reduce(
      (sum, cb) => sum + cb.amount,
      0,
    );
    const cashbackUsed = sale.Cashbacks.reduce(
      (sum, cb) => sum + cb.usedAmount,
      0,
    );
    const availableCashback = cashbackOriginal - cashbackUsed;

    const expiresAt = sale.Cashbacks[0]
      ? new Date(sale.Cashbacks[0].expiresAt)
      : null;

    return {
      availableCashback,
      caCreatedAt: sale.caCreatedAt,
      caNumero: sale.caNumero,
      cashbackOriginal,
      cashbackUsed,
      expiresAt,
      id: sale.id,
      total: sale.total,
    };
  });

  return {
    client,
    sales,
    totalAvailableCashback: data.totalAvailableCashback,
  };
});
export type ClientDataPromise = ReturnType<typeof getClientData>;

export const getVouchers = cache(async (clientId: string) => {
  const session = await auth();
  if (!session.user?.isAdmin) {
    redirect("/admin/auth/login");
  }
  if (!ZNanoId.safeParse(clientId).success) {
    redirect("/admin/clients");
  }
  return trpcCaller.admin.voucher.list({ clientId });
});
export type VoucherDataPromise = ReturnType<typeof getVouchers>;

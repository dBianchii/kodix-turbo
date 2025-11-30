import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useTRPC } from "@cash/api/trpc/react/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ClientNotFoundError } from "./not-found-error";

export const useGetClientByIdSuspenseQuery = () => {
  const trpc = useTRPC();
  const { clientId } =
    useParams<Awaited<PageProps<"/admin/clients/[clientId]">["params"]>>();

  const getClientByIdQuery = useSuspenseQuery(
    trpc.admin.client.getById.queryOptions({ clientId }),
  );

  const data = getClientByIdQuery.data;

  if (!data) {
    throw new ClientNotFoundError();
  }

  const derivedData = useMemo(() => {
    const { client, sales: rawSales } = data;
    const now = new Date();

    const totalAvailableCashback = rawSales
      .flatMap((sale) => sale.Cashbacks)
      .filter((cb) => new Date(cb.expiresAt) > now)
      .reduce((sum, cb) => sum + cb.amount - cb.usedAmount, 0);

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

      // All cashbacks from the same sale expire at the same time, so use the first one
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
      totalAvailableCashback,
    };
  }, [data]);

  return {
    ...getClientByIdQuery,
    data: derivedData,
  };
};

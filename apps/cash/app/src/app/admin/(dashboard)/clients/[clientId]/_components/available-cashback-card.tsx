"use client";

import { formatCurrency } from "@kodix/shared/intl-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

import { useGetClientByIdSuspenseQuery } from "./utils/use-get-client-by-id-query";

export function AvailableCashbackCard() {
  const {
    data: { totalAvailableCashback },
  } = useGetClientByIdSuspenseQuery();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">
          Cashback Disponível
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl text-green-600">
          {formatCurrency("BRL", totalAvailableCashback)}
        </div>
      </CardContent>
    </Card>
  );
}

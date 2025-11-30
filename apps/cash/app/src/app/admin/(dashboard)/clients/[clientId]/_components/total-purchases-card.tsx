"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

import { useGetClientByIdSuspenseQuery } from "./utils/use-get-client-by-id-query";

export function TotalPurchasesCard() {
  const {
    data: { sales },
  } = useGetClientByIdSuspenseQuery();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">Total de Compras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{sales.length}</div>
      </CardContent>
    </Card>
  );
}

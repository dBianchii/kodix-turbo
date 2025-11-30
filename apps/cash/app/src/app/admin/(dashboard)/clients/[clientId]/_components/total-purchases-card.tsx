import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

import { getClientData } from "./data";

export async function TotalPurchasesCard({
  paramsPromise,
}: {
  paramsPromise: Promise<{ clientId: string }>;
}) {
  const { clientId } = await paramsPromise;
  const { sales } = await getClientData(clientId);

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

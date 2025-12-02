import { formatCurrency } from "@kodix/shared/intl-utils";
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
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">Total de Compras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{sales.length}</div>
      </CardContent>
    </Card>
  );
}

export async function AvailableCashbackCard({
  paramsPromise,
}: {
  paramsPromise: Promise<{ clientId: string }>;
}) {
  const { clientId } = await paramsPromise;
  const { totalAvailableCashback } = await getClientData(clientId);

  return (
    <Card className="shadow-none">
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

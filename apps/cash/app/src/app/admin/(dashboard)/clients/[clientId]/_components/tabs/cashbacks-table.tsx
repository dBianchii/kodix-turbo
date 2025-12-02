import { formatCurrency, formatDate } from "@kodix/shared/intl-utils";
import { Badge } from "@kodix/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { AlertCircle } from "lucide-react";

import { getClientData } from "../data";

export async function CashbacksTable({
  paramsPromise,
}: {
  paramsPromise: Promise<{ clientId: string }>;
}) {
  const { clientId } = await paramsPromise;
  const { sales } = await getClientData(clientId);

  return (
    <Table containerClassName="rounded-md border">
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Nº da venda</TableHead>
          <TableHead>Valor Compra</TableHead>
          <TableHead>Cashback</TableHead>
          <TableHead>Resgatado</TableHead>
          <TableHead>Disponível</TableHead>
          <TableHead>Expira em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => {
          const isExpired =
            sale.expiresAt && new Date(sale.expiresAt) < new Date();

          return (
            <TableRow key={sale.id}>
              <TableCell>{formatDate(sale.caCreatedAt)}</TableCell>
              <TableCell className="font-mono">{sale.caNumero}</TableCell>
              <TableCell className="tabular-nums">
                {formatCurrency("BRL", sale.total)}
              </TableCell>
              <TableCell className="tabular-nums">
                {sale.cashbackOriginal > 0 ? (
                  formatCurrency("BRL", sale.cashbackOriginal)
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="tabular-nums">
                {sale.cashbackUsed > 0 ? (
                  <span className="text-orange-600">
                    {formatCurrency("BRL", sale.cashbackUsed)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {sale.availableCashback > 0 ? (
                  <span
                    className={
                      isExpired
                        ? "text-muted-foreground line-through"
                        : "text-green-600"
                    }
                  >
                    {formatCurrency("BRL", sale.availableCashback)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {sale.expiresAt ? (
                  <div className="flex items-center gap-2">
                    <span>{formatDate(sale.expiresAt)}</span>
                    {isExpired && sale.availableCashback > 0 && (
                      <Badge className="gap-1" variant="destructive">
                        <AlertCircle className="h-3 w-3" />
                        Expirado
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
        {!sales.length && (
          <TableRow>
            <TableCell
              className="h-24 text-center text-muted-foreground"
              colSpan={7}
            >
              Nenhuma compra encontrada
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

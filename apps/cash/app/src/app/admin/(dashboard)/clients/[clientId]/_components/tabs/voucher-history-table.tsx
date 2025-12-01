import { formatCurrency, formatDate } from "@kodix/shared/intl-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";

import { formatVoucherCode } from "~/utils/voucherUtils";

import { getClientData, getVouchers } from "../data";
import { ViewVoucherButton } from "./view-voucher-button";

export async function VoucherHistoryTable({
  paramsPromise,
}: {
  paramsPromise: Promise<{ clientId: string }>;
}) {
  const { clientId } = await paramsPromise;
  const [vouchers, clientData] = await Promise.all([
    getVouchers(clientId),
    getClientData(clientId),
  ]);

  return (
    <Table containerClassName="rounded-md border">
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Valor da Compra</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Gerado por</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {vouchers?.map((voucher) => {
          const amount = voucher.VoucherCashbacks.reduce(
            (sum, vc) => sum + vc.amount,
            0,
          );
          return (
            <TableRow key={voucher.id}>
              <TableCell className="font-mono">
                {formatVoucherCode(voucher.codeNumber)}
              </TableCell>
              <TableCell className="text-green-600 tabular-nums">
                {formatCurrency("BRL", amount)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatCurrency("BRL", voucher.purchaseTotal)}
              </TableCell>
              <TableCell>{formatDate(voucher.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground">
                {voucher.CreatedByUser.name}
              </TableCell>
              <TableCell className="text-right">
                <ViewVoucherButton
                  client={clientData.client}
                  voucher={{
                    ...voucher,
                    amount,
                  }}
                />
              </TableCell>
            </TableRow>
          );
        })}
        {vouchers.length ? null : (
          <TableRow>
            <TableCell
              className="h-24 text-center text-muted-foreground"
              colSpan={5}
            >
              Nenhum vale-compra gerado
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

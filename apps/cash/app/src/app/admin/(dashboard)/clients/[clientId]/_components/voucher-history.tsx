"use client";

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

import { useListVouchersSuspenseQuery } from "./utils/use-list-vouchers-query";

export function VoucherHistory() {
  const vouchers = useListVouchersSuspenseQuery();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Valor da Compra</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Gerado por</TableHead>
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
              </TableRow>
            );
          })}
          {(!vouchers || vouchers.length === 0) && (
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
    </div>
  );
}

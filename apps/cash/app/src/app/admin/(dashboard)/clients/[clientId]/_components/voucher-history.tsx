"use client";

import { useParams } from "next/navigation";
import { useTRPC } from "@cash/api/trpc/react/client";
import { formatCurrency, formatDate } from "@kodix/shared/intl-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function VoucherHistory() {
  const trpc = useTRPC();

  const { clientId } =
    useParams<Awaited<PageProps<"/admin/clients/[clientId]">["params"]>>();

  const { data: vouchers, isPending } = useQuery(
    trpc.admin.voucher.list.queryOptions({ clientId }),
  );

  if (isPending) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Valor da Compra</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Gerado por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers?.map((voucher) => (
            <TableRow key={voucher.id}>
              <TableCell className="font-medium font-mono">
                {voucher.code}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency("BRL", voucher.amount)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency("BRL", voucher.purchaseTotal)}
              </TableCell>
              <TableCell>{formatDate(voucher.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground">
                {voucher.createdBy}
              </TableCell>
            </TableRow>
          ))}
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

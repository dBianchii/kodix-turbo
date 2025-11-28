"use client";

import { useTRPC } from "@cash/api/trpc/react/client";
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));

interface VoucherHistoryProps {
  clientId: string;
}

export function VoucherHistory({ clientId }: VoucherHistoryProps) {
  const trpc = useTRPC();

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
                {formatCurrency(voucher.amount)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(voucher.purchaseTotal)}
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

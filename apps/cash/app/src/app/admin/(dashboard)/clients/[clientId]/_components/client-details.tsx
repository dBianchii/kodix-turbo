"use client";

import { useRouter } from "next/navigation";
import { useTRPC } from "@cash/api/trpc/react/client";
import { Badge } from "@kodix/ui/badge";
import { Button } from "@kodix/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export function ClientDetails({ clientId }: { clientId: string }) {
  const trpc = useTRPC();
  const router = useRouter();

  const { data, isPending, error } = useQuery(
    trpc.client.getById.queryOptions({ clientId }),
  );

  if (isPending) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          {error ? error.message : "Cliente não encontrado"}
        </p>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  const { client, cashbackTotal, sales } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} size="icon" variant="ghost">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-bold text-2xl tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Cashback Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {new Intl.NumberFormat("pt-BR", {
                currency: "BRL",
                style: "currency",
              }).format(cashbackTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total de Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{sales.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-xl tracking-tight">
          Histórico de Cashbacks
        </h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Número</TableHead>
                <TableHead className="text-right">Valor da Compra</TableHead>
                <TableHead className="text-right">Cashback Gerado</TableHead>
                <TableHead>Expira em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const isExpired =
                  sale.expiresAt && new Date(sale.expiresAt) < new Date();
                return (
                  <TableRow
                    className={
                      isExpired
                        ? "bg-muted/30 opacity-60 hover:bg-muted/40"
                        : ""
                    }
                    key={sale.id}
                  >
                    <TableCell>
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(sale.caCreatedAt))}
                    </TableCell>
                    <TableCell className="font-mono">{sale.caNumero}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        currency: "BRL",
                        style: "currency",
                      }).format(Number(sale.total))}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        isExpired
                          ? "text-muted-foreground line-through"
                          : "text-green-600"
                      }`}
                    >
                      {sale.cashbackAmount
                        ? new Intl.NumberFormat("pt-BR", {
                            currency: "BRL",
                            style: "currency",
                          }).format(Number(sale.cashbackAmount))
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {sale.expiresAt ? (
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="text-sm">
                            {new Intl.DateTimeFormat("pt-BR", {
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }).format(sale.expiresAt)}
                          </span>
                          {isExpired && (
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
              {sales.length === 0 && (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={5}
                  >
                    Nenhuma compra encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

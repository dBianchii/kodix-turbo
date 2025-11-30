"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@kodix/shared/intl-utils";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kodix/ui/tabs";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { useClientDetailsSearchParams } from "./client-details-url-state";
import { RedemptionDialogButton } from "./redemption-dialog-button";
import { useGetClientByIdSuspenseQuery } from "./utils/use-get-client-by-id-query";
import { VoucherHistory } from "./voucher-history";

export function ClientDetails() {
  const [{ tab }, setSearchParams] = useClientDetailsSearchParams();

  const {
    data: { client, totalAvailableCashback, sales },
  } = useGetClientByIdSuspenseQuery();

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/admin/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
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
              Cashback Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {formatCurrency("BRL", totalAvailableCashback)}
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

      <Tabs
        onValueChange={(v) =>
          setSearchParams({ tab: v as "cashbacks" | "vouchers" })
        }
        value={tab}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="cashbacks">Histórico de Cashbacks</TabsTrigger>
            <TabsTrigger value="vouchers">Vale-Compras</TabsTrigger>
          </TabsList>
          <RedemptionDialogButton
            availableCashback={totalAvailableCashback}
            clientId={client.id}
          />
        </div>

        <TabsContent value="cashbacks">
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
        </TabsContent>
        <TabsContent value="vouchers">
          <VoucherHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

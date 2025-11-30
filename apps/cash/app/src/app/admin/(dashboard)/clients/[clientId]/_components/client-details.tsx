"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { AlertCircle, ArrowLeft, Ticket } from "lucide-react";

import { useClientDetailsSearchParams } from "./client-details-url-state";
import { RedemptionModal } from "./redemption-modal";
import { useGetClientByIdQuery } from "./use-get-client-by-id-query";
import { VoucherHistory } from "./voucher-history";

export function ClientDetails() {
  const router = useRouter();
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);
  const [{ tab }, setSearchParams] = useClientDetailsSearchParams();

  const {
    data: { client, cashbackAvailable, sales },
  } = useGetClientByIdQuery();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} size="icon" variant="ghost">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-2xl tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
        <Button
          disabled={cashbackAvailable <= 0}
          onClick={() => setRedemptionModalOpen(true)}
        >
          <Ticket className="mr-2 h-4 w-4" />
          Resgatar Cashback
        </Button>
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
              {formatCurrency("BRL", cashbackAvailable)}
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
        <TabsList>
          <TabsTrigger value="cashbacks">Histórico de Cashbacks</TabsTrigger>
          <TabsTrigger value="vouchers">Vale-Compras</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="cashbacks">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nº da venda</TableHead>
                  <TableHead className="text-right">Valor Compra</TableHead>
                  <TableHead className="text-right">Cashback</TableHead>
                  <TableHead className="text-right">Resgatado</TableHead>
                  <TableHead className="text-right">Disponível</TableHead>
                  <TableHead>Expira em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => {
                  const isExpired =
                    sale.expiresAt && new Date(sale.expiresAt) < new Date();
                  const hasAvailable =
                    sale.cashbackAvailable && sale.cashbackAvailable > 0;

                  return (
                    <TableRow key={sale.id}>
                      <TableCell>{formatDate(sale.caCreatedAt)}</TableCell>
                      <TableCell className="font-mono">
                        {sale.caNumero}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency("BRL", sale.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        {sale.cashbackOriginal !== null
                          ? formatCurrency("BRL", sale.cashbackOriginal)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        {sale.cashbackUsed
                          ? formatCurrency("BRL", sale.cashbackUsed)
                          : "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${() => {
                          if (isExpired && hasAvailable) {
                            return "text-muted-foreground line-through";
                          }
                          if (hasAvailable) {
                            return "text-green-600";
                          }
                          return "text-muted-foreground";
                        }}`}
                      >
                        {sale.cashbackAvailable
                          ? formatCurrency("BRL", sale.cashbackAvailable)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {sale.expiresAt ? (
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="text-sm">
                              {formatDate(sale.expiresAt)}
                            </span>
                            {isExpired && hasAvailable && (
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
                      colSpan={7}
                    >
                      Nenhuma compra encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vouchers">
          <VoucherHistory />
        </TabsContent>
      </Tabs>

      <RedemptionModal
        availableCashback={cashbackAvailable}
        clientId={client.id}
        onOpenChange={setRedemptionModalOpen}
        open={redemptionModalOpen}
      />
    </div>
  );
}

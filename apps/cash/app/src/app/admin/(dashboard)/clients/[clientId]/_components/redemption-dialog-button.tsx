"use client";

import { useState } from "react";
import { CASHBACK_REDEMPTION_PERCENTAGE } from "@cash/api/constants";
import { useTRPC } from "@cash/api/trpc/react/client";
import { formatCurrency } from "@kodix/shared/intl-utils";
import { Button } from "@kodix/ui/button";
import { CurrencyInput } from "@kodix/ui/common/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kodix/ui/dialog";
import { Label } from "@kodix/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Printer, Ticket } from "lucide-react";

import { formatVoucherCode } from "~/utils/voucherUtils";

interface RedemptionDialogButtonProps {
  availableCashback: number;
  clientId: string;
}

export function RedemptionDialogButton({
  availableCashback,
  clientId,
}: RedemptionDialogButtonProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [purchaseTotal, setPurchaseTotal] = useState<number | undefined>();
  const [createdVoucher, setCreatedVoucher] = useState<{
    codeNumber: number;
    amount: number;
  } | null>(null);

  const purchaseValue = purchaseTotal ?? 0;
  const maxFromPurchase = purchaseValue * CASHBACK_REDEMPTION_PERCENTAGE;
  const maxRedeemable = Math.min(maxFromPurchase, availableCashback);
  const canRedeem = purchaseValue > 0 && maxRedeemable > 0;

  const createVoucherMutation = useMutation(
    trpc.admin.voucher.create.mutationOptions({
      onSuccess: (data) => {
        setCreatedVoucher({ amount: data.amount, codeNumber: data.codeNumber });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.client.getById.queryKey({ clientId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.voucher.list.queryKey({ clientId }),
        });
      },
    }),
  );

  const handleSubmit = () => {
    if (!canRedeem) return;

    createVoucherMutation.mutate({
      clientId,
      purchaseTotal: purchaseValue,
      redemptionAmount: maxRedeemable,
    });
  };

  const handleClose = () => {
    setPurchaseTotal(undefined);
    setCreatedVoucher(null);
    createVoucherMutation.reset();
  };

  const handlePrint = () => {
    // TODO: Implement PDF generation
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={availableCashback <= 0}>
          <Ticket className="mr-2 h-4 w-4" />
          Resgatar Cashback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {createdVoucher ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Vale-Compra Gerado!
              </DialogTitle>
              <DialogDescription>
                O vale-compra foi gerado com sucesso.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="text-muted-foreground text-sm">Código</p>
                <p className="font-bold font-mono text-3xl">
                  {formatVoucherCode(createdVoucher.codeNumber)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Valor</p>
                <p className="font-bold text-2xl text-green-600">
                  {formatCurrency("BRL", createdVoucher.amount)}
                </p>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 pt-5 sm:flex">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2" />
                Imprimir
              </Button>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Resgatar Cashback</DialogTitle>
              <DialogDescription>
                Informe o valor total da compra para calcular o resgate.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseTotal">Valor total da compra</Label>
                <CurrencyInput
                  id="purchaseTotal"
                  onValueChange={(values) =>
                    setPurchaseTotal(values.floatValue)
                  }
                  placeholder="0,00"
                  value={purchaseTotal}
                />
              </div>

              {purchaseValue > 0 && (
                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Cashback disponível
                    </span>
                    <span>{formatCurrency("BRL", availableCashback)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Máx. {CASHBACK_REDEMPTION_PERCENTAGE * 100}% da compra
                    </span>
                    <span>{formatCurrency("BRL", maxFromPurchase)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium">
                      <span>Você pode resgatar</span>
                      <span className="text-green-600">
                        {formatCurrency("BRL", maxRedeemable)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {createVoucherMutation.error && (
                <p className="text-destructive text-sm">
                  {createVoucherMutation.error.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose} variant="outline">
                Cancelar
              </Button>
              <Button
                disabled={!canRedeem || createVoucherMutation.isPending}
                onClick={handleSubmit}
              >
                {createVoucherMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Gerar Vale-Compra
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

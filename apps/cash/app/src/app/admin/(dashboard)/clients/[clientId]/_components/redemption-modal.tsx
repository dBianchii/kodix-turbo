"use client";

import { useState } from "react";
import { useTRPC } from "@cash/api/trpc/react/client";
import { Button } from "@kodix/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kodix/ui/dialog";
import { Input } from "@kodix/ui/input";
import { Label } from "@kodix/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Printer } from "lucide-react";

const REDEMPTION_PERCENTAGE = 0.4; // 40%

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);

interface RedemptionModalProps {
  availableCashback: number;
  clientId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function RedemptionModal({
  availableCashback,
  clientId,
  onOpenChange,
  open,
}: RedemptionModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [purchaseTotal, setPurchaseTotal] = useState("");
  const [createdVoucher, setCreatedVoucher] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  const purchaseValue = Number(purchaseTotal.replace(",", ".")) || 0;
  const maxFromPurchase = purchaseValue * REDEMPTION_PERCENTAGE;
  const maxRedeemable = Math.min(maxFromPurchase, availableCashback);
  const canRedeem = purchaseValue > 0 && maxRedeemable > 0;

  const createVoucherMutation = useMutation(
    trpc.admin.voucher.create.mutationOptions({
      onSuccess: (data) => {
        setCreatedVoucher({ amount: data.amount, code: data.code });
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
    setPurchaseTotal("");
    setCreatedVoucher(null);
    createVoucherMutation.reset();
    onOpenChange(false);
  };

  const handlePrint = () => {
    // TODO: Implement PDF generation
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
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
                  {createdVoucher.code}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Valor</p>
                <p className="font-bold text-2xl text-green-600">
                  {formatCurrency(createdVoucher.amount)}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
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
                <div className="relative">
                  <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    className="pl-10"
                    id="purchaseTotal"
                    onChange={(e) => setPurchaseTotal(e.target.value)}
                    placeholder="0,00"
                    type="text"
                    value={purchaseTotal}
                  />
                </div>
              </div>

              {purchaseValue > 0 && (
                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Cashback disponível
                    </span>
                    <span>{formatCurrency(availableCashback)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Máx. {REDEMPTION_PERCENTAGE * 100}% da compra
                    </span>
                    <span>{formatCurrency(maxFromPurchase)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium">
                      <span>Você pode resgatar</span>
                      <span className="text-green-600">
                        {formatCurrency(maxRedeemable)}
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

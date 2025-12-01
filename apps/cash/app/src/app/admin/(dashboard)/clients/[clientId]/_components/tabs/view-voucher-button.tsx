"use client";

import type { clients, vouchers } from "@cash/db/schema";
import { Button } from "@kodix/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kodix/ui/tooltip";
import { FileText, Loader2 } from "lucide-react";

import { useRenderVoucherPdf } from "./use-render-voucher-pdf";

interface PrintVoucherButtonProps {
  voucher: Pick<
    typeof vouchers.$inferSelect,
    "codeNumber" | "purchaseTotal" | "createdAt"
  > & {
    amount: number;
  };
  client?: Pick<typeof clients.$inferSelect, "name" | "document" | "phone">;
}

export function ViewVoucherButton({
  voucher,
  client,
}: PrintVoucherButtonProps) {
  const renderPdfMutation = useRenderVoucherPdf();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          disabled={renderPdfMutation.isPending}
          onClick={() => {
            renderPdfMutation.mutate({
              client,
              voucher,
            });
          }}
          size="icon-sm"
          variant="ghost"
        >
          {renderPdfMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Visualizar Vale-Compra</TooltipContent>
    </Tooltip>
  );
}

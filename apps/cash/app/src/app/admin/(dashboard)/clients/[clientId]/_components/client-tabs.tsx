"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kodix/ui/tabs";

import { CashbacksTable } from "./cashbacks-table";
import { useClientDetailsSearchParams } from "./client-details-url-state";
import { RedemptionDialogButtonWrapper } from "./redemption-dialog-button-wrapper";
import { TableSkeleton } from "./skeletons";
import { VoucherHistory } from "./voucher-history";

export function ClientTabs() {
  const [{ tab }, setSearchParams] = useClientDetailsSearchParams();

  return (
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
        <Suspense fallback={null}>
          <RedemptionDialogButtonWrapper />
        </Suspense>
      </div>

      <TabsContent value="cashbacks">
        <Suspense fallback={<TableSkeleton />}>
          <CashbacksTable />
        </Suspense>
      </TabsContent>
      <TabsContent value="vouchers">
        <Suspense fallback={<TableSkeleton />}>
          <VoucherHistory />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}

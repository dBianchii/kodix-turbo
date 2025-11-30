import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTableSkeleton } from "@kodix/ui/common/data-table/data-table-skeleton";

import PageWrapper from "~/app/_components/page-wrapper";

import { AvailableCashbackCard } from "./_components/available-cashback-card";
import { ClientHeader } from "./_components/client-header";
import { getClientData } from "./_components/data";
import { RedemptionDialogButtonClient } from "./_components/redemption-dialog-button/redemption-dialog-button";
import {
  CardSkeleton,
  ClientHeaderSkeleton,
  TabsSkeleton,
} from "./_components/skeletons";
import { CashbacksTable } from "./_components/tabs/cashbacks-table";
import { ClientTabs } from "./_components/tabs/client-tabs";
import { VoucherHistoryTable } from "./_components/tabs/voucher-history-table";
import { TotalPurchasesCard } from "./_components/total-purchases-card";

export const metadata: Metadata = {
  title: "Detalhes do Cliente | Cash Admin",
};

export default function ClientIdPage({
  params,
}: PageProps<"/admin/clients/[clientId]">) {
  return (
    <PageWrapper>
      <div className="min-w-0 space-y-8">
        <Suspense fallback={<ClientHeaderSkeleton />}>
          <ClientHeader paramsPromise={params} />
        </Suspense>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<CardSkeleton />}>
            <AvailableCashbackCard paramsPromise={params} />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <TotalPurchasesCard paramsPromise={params} />
          </Suspense>
        </div>

        <Suspense fallback={<TabsSkeleton />}>
          <ClientTabs
            cashbacksContent={
              <Suspense
                fallback={
                  <DataTableSkeleton
                    columnCount={5}
                    rowCount={5}
                    showViewOptions={false}
                    withPagination={false}
                  />
                }
              >
                <CashbacksTable paramsPromise={params} />
              </Suspense>
            }
            redemptionButton={
              <RedemptionDialogButtonClient
                getClientDataPromise={params.then((p) =>
                  getClientData(p.clientId),
                )}
              />
            }
            vouchersContent={
              <Suspense
                fallback={
                  <DataTableSkeleton
                    columnCount={5}
                    rowCount={5}
                    showViewOptions={false}
                    withPagination={false}
                  />
                }
              >
                <VoucherHistoryTable paramsPromise={params} />
              </Suspense>
            }
          />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

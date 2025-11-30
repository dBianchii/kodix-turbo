import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { redirect } from "next/navigation";
import {
  batchPrefetch,
  HydrateClient,
  trpc,
} from "@cash/api/trpc/react/server";
import { auth } from "@cash/auth";
import { ZNanoId } from "@kodix/shared/utils";

import PageWrapper from "~/app/_components/page-wrapper";

import { AvailableCashbackCard } from "./_components/available-cashback-card";
import { ClientHeader } from "./_components/client-header";
import { ClientTabs } from "./_components/client-tabs";
import { ErrorFallback } from "./_components/error-fallback";
import {
  CardSkeleton,
  ClientHeaderSkeleton,
  TableSkeleton,
  TabsHeaderSkeleton,
} from "./_components/skeletons";
import { TotalPurchasesCard } from "./_components/total-purchases-card";

export const metadata: Metadata = {
  title: "Detalhes do Cliente | Cash Admin",
};

export default function ClientIdPage({
  params,
}: PageProps<"/admin/clients/[clientId]">) {
  return (
    <PageWrapper>
      <Suspense fallback={<ClientIdPageSkeleton />}>
        <ClientIdPageContent paramsPromise={params} />
      </Suspense>
    </PageWrapper>
  );
}

function ClientIdPageSkeleton() {
  return (
    <div className="min-w-0 space-y-8">
      <ClientHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="space-y-4">
        <TabsHeaderSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}

async function ClientIdPageContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ clientId: string }>;
}) {
  const session = await auth();
  if (!session.user) {
    redirect("/admin/auth/login");
  }

  const { clientId } = await paramsPromise;

  if (!ZNanoId.safeParse(clientId).success) {
    redirect("/admin/clients");
  }

  batchPrefetch([
    trpc.admin.client.getById.queryOptions({ clientId }),
    trpc.admin.voucher.list.queryOptions({ clientId }),
  ]);

  return (
    <HydrateClient>
      <ErrorBoundary errorComponent={ErrorFallback}>
        <div className="min-w-0 space-y-8">
          <ClientHeader />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AvailableCashbackCard />
            <TotalPurchasesCard />
          </div>
          <ClientTabs />
        </div>
      </ErrorBoundary>
    </HydrateClient>
  );
}

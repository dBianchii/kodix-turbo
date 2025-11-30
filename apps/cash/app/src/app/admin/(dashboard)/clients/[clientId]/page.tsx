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

import PageWrapper, { LoadingPage } from "~/app/_components/page-wrapper";

import { ClientDetails } from "./_components/client-details";
import { ErrorFallback } from "./_components/error-fallback";

export const metadata: Metadata = {
  title: "Detalhes do Cliente | Cash Admin",
};

export default function ClientIdPage({
  params,
}: PageProps<"/admin/clients/[clientId]">) {
  return (
    <PageWrapper>
      <Suspense fallback={<LoadingPage />}>
        <ClientIdPageContent paramsPromise={params} />
      </Suspense>
    </PageWrapper>
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
        <Suspense fallback={<LoadingPage />}>
          <ClientDetails />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

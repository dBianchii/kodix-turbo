import type { Metadata } from "next";
import { Suspense } from "react";

import PageWrapper, { LoadingPage } from "~/app/_components/page-wrapper";

import { ClientDetails } from "./_components/client-details";

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
  const { clientId } = await paramsPromise;
  if (!clientId || typeof clientId !== "string")
    throw new Error("Client ID is required");

  return <ClientDetails clientId={clientId} />;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { HydrateClient, prefetch, trpc } from "@cash/api/trpc/react/server";
import { auth } from "@cash/auth";
import { createLoader } from "nuqs/server";

import PageWrapper, { LoadingPage } from "~/app/_components/page-wrapper";

import { ClientsTable } from "./_components/clients-table";
import { createClientsSearchParamsParsers } from "./_components/clients-url-state";

const loadSearchParams = createLoader(createClientsSearchParamsParsers);

export const metadata: Metadata = {
  title: "Clientes | Cash Admin",
};

export default function AdminClientsPage({
  searchParams,
}: PageProps<"/admin/clients">) {
  return (
    <PageWrapper>
      <Suspense fallback={<LoadingPage />}>
        <PageContent searchParams={searchParams} />
      </Suspense>
    </PageWrapper>
  );
}

async function PageContent({
  searchParams,
}: Pick<PageProps<"/admin/clients">, "searchParams">) {
  const session = await auth();
  if (!session.user) {
    redirect("/admin/auth/login");
  }

  const params = await loadSearchParams(searchParams);

  prefetch(
    trpc.admin.client.list.queryOptions({
      globalSearch: params.globalSearch,
      page: params.page,
      perPage: params.perPage,
      sort: params.sort,
    }),
  );

  return (
    <HydrateClient>
      <ClientsTable />
    </HydrateClient>
  );
}

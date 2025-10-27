import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@cash/auth";

import PageWrapper, { LoadingPage } from "~/app/_components/page-wrapper";

import { SalesTable } from "./_components/sales-table";

async function PageContent() {
  const session = await auth();
  if (!session.user) {
    redirect("/admin/auth/login");
  }

  return <SalesTable />;
}

export default function AdminVendasPage() {
  return (
    <PageWrapper>
      <Suspense fallback={<LoadingPage />}>
        <PageContent />
      </Suspense>
    </PageWrapper>
  );
}

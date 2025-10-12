import { redirect } from "next/navigation";
import { auth } from "@cash/auth";

import PageWrapper from "~/app/_components/page-wrapper";

import { SalesTable } from "./_components/sales-table";

export default async function AdminVendasPage() {
  const session = await auth();
  if (!session.user) {
    redirect("/admin/auth/login");
  }

  return (
    <PageWrapper>
      <SalesTable />
    </PageWrapper>
  );
}

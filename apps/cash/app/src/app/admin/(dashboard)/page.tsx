import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@cash/auth";

import PageWrapper, { LoadingPage } from "~/app/_components/page-wrapper";

async function PageContent() {
  const session = await auth();
  if (!session.user) {
    redirect("/admin/auth/login");
  }

  return <div>Ola!</div>;
}

export default function AdminDashboardPage() {
  return (
    <PageWrapper>
      <Suspense fallback={<LoadingPage />}>
        <PageContent />
      </Suspense>
    </PageWrapper>
  );
}

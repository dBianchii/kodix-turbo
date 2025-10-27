import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@cash/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

import { LoadingPage } from "~/app/_components/page-wrapper";

import { LoginForm } from "./_components/login-form";

async function PageContent() {
  const { user } = await auth();
  if (user) {
    redirect("/admin");
  }

  return (
    <section className="mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
      <div className="my-4 font-extrabold text-4xl">Cash Admin</div>
      <Card className="w-[275px] sm:w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-bold text-lg">
            Sign in to admin panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <PageContent />
    </Suspense>
  );
}

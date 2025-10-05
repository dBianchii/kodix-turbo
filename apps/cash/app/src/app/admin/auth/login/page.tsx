import { redirect } from "next/navigation";
import { auth } from "@cash/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@kodix/ui/card";

import { LoginForm } from "./_components/login-form";

export default async function AdminLoginPage() {
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

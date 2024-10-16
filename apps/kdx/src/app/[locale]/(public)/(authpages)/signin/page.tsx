import { auth } from "@kdx/auth";
import { Link, redirect } from "@kdx/locales/next-intl/navigation";
import { getTranslations } from "@kdx/locales/next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";

import { ProviderButtons } from "../_components/provider-buttons";
import { PasswordSignInForm } from "./_components/password-signin-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const { user } = await auth();
  if (user) redirect(searchParams?.callbackUrl ?? "/team");
  const t = await getTranslations();

  let signUpHref = "/signup";
  if (searchParams?.invite) signUpHref += `?invite=${searchParams.invite}`;

  return (
    <section className="mx-auto flex flex-1 flex-col items-center justify-center px-6 py-8 lg:py-0">
      <Link href="/" className="my-4 text-4xl font-extrabold">
        Kodix
      </Link>
      <Card className="w-[275px] sm:w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-bold text-lg">
            {t("Sign in to your account")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center">
            <div className="flex flex-col">
              <PasswordSignInForm callbackUrl={searchParams?.callbackUrl} />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("Or continue with")}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <ProviderButtons
                  callbackUrl={searchParams?.callbackUrl}
                  invite={searchParams?.invite}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Link href={signUpHref} className="mt-8 text-sm font-medium">
        {t("Dont have an account")}
      </Link>
    </section>
  );
}

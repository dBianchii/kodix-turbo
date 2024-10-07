import Link from "next/link";

import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/next-intl/navigation";
import { getTranslations } from "@kdx/locales/next-intl/server";

import { ProviderButtons } from "../_components/provider-buttons";
import { PasswordSignupForm } from "./_components/password-signup-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const { user } = await auth();
  if (user) return redirect(searchParams?.callbackUrl ?? "/");
  const t = await getTranslations();
  return (
    <div className="container my-auto flex max-w-2xl">
      <div className="flex w-full flex-col rounded-xl bg-card md:border">
        <div className="space-y-6 p-4 py-16 md:p-12">
          <h1 className="text-3xl font-bold">
            {t("Create your Kodix account")}
          </h1>
          <p className="text-muted-foreground">
            {t("Create an account to access all the features of Kodix")}
          </p>
          <div className="space-y-4">
            <PasswordSignupForm invite={searchParams?.invite} />
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
            <div className="flex space-x-2">
              <ProviderButtons
                callbackUrl={searchParams?.callbackUrl}
                invite={searchParams?.invite}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {t("Already have an account")}{" "}
              <Link href="/signin" className="text-white underline">
                {t("Sign in")}
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              {t("By continuing you agree to our")}{" "}
              <a href="#" className="text-white underline">
                {t("Terms of Service")}
              </a>{" "}
              e{" "}
              <a href="#" className="text-white underline">
                {t("Privacy policy")}
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

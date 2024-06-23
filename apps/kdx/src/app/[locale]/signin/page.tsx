import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";

import { EXPO_COOKIE_NAME } from "~/app/api/auth/[...nextauth]/route";
import { SignInButtons } from "./_components/sign-in-buttons";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const session = await auth();
  if (session) redirect(searchParams?.callbackUrl ?? "/");
  const t = await getI18n();
  const isFromExpo = !!cookies().get(EXPO_COOKIE_NAME);

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
              <SignInButtons
                searchParams={searchParams}
                isFromExpo={isFromExpo}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

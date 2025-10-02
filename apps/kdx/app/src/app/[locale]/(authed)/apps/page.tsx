import { Suspense } from "react";
import { H1, Lead } from "@kodix/ui/typography";
import { getTranslations } from "next-intl/server";

import { trpcCaller } from "@kdx/api/trpc/react/server";
import { auth } from "@kdx/auth";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";

import { AppCardSkeleton } from "../../_components/app/kodix-app";
import { KodixApps } from "./_components/kodix-apps";

export default async function AppsPage() {
  const t = await getTranslations();
  const apps = trpcCaller.app.getAll();
  const authResponse = auth();

  return (
    <MaxWidthWrapper className="pt-4">
      <H1>{t("App")}</H1>
      <Lead className="mt-2">
        {t("Take a look at all available apps and install them")}
      </Lead>
      <br />
      <div className="grid-col-1 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Suspense
          fallback={["one-app-skeleton", "two-app-skeleton"].map((item) => (
            <AppCardSkeleton key={item} />
          ))}
        >
          <Wait />
          <KodixApps appsPromise={apps} authPromise={authResponse} />
        </Suspense>
      </div>
    </MaxWidthWrapper>
  );
}

async function Wait() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return null;
}

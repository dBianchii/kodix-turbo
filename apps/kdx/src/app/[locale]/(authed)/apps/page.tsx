import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { auth } from "@kdx/auth";
import { H1, Lead } from "@kdx/ui/typography";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { trpcCaller } from "~/trpc/server";
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
          fallback={Array.from({ length: 2 }).map((_, index) => (
            <AppCardSkeleton key={index} />
          ))}
        >
          <KodixApps appsPromise={apps} authPromise={authResponse} />
        </Suspense>
      </div>
    </MaxWidthWrapper>
  );
}

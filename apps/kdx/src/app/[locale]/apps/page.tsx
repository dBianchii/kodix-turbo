import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";
import { H1, Lead } from "@kdx/ui/typography";

import { KodixApp } from "~/app/[locale]/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function AppsPage() {
  const apps = await api.app.getAll();
  const session = await auth();
  const t = await getI18n();
  return (
    <MaxWidthWrapper>
      <H1>{t("App")}</H1>
      <Lead className="mt-2">
        {t("Take a look at all available apps and install them")}
      </Lead>
      <br />

      <div className="grid-col-1 grid grid-cols-1 gap-3 md:grid-cols-3">
        {apps.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id as KodixAppId}
              installed={app.installed}
              session={session}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}

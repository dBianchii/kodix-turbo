import { redirect } from "next/navigation";

import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";

import { KodixApp } from "~/app/[locale]/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function SettingsAppsPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  const apps = await api.app.getInstalled();
  const t = await getI18n();
  return (
    <MaxWidthWrapper>
      <h1 className="text-lg font-bold text-foreground">
        {t("Your installed apps")}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("settings.These are your installed apps")}
      </p>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id as KodixAppId}
              installed={true}
              session={session}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}

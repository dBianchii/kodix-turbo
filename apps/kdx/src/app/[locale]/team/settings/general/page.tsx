import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { getI18n } from "@kdx/locales/server";

import { EditTeamNameCard } from "./_components/edit-team-name-card";
import SettingsEditCardSkeleton from "./_components/edit-team-name-card-skeleton";

export default async function SettingsGeneralPage() {
  const { user } = await auth();
  if (!user) redirect("/");
  const t = await getI18n();
  return (
    <div className="mt-8 space-y-6 md:mt-0">
      <div>
        <h2 className="text-center text-2xl font-bold md:text-left">
          {t("General")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t(
            "settings.Change the name of your team and manage your participation",
          )}
        </p>
      </div>
      <div className="space-y-4">
        <Suspense fallback={<SettingsEditCardSkeleton />}>
          <EditTeamNameCard />
        </Suspense>
      </div>
    </div>
  );
}

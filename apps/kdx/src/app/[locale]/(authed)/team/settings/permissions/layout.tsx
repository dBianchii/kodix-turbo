import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { auth } from "@kdx/auth";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { teams } from "@kdx/db/schema";
import { redirect } from "@kdx/locales/next-intl/navigation";

import { AppSwitcher } from "~/app/[locale]/_components/app-switcher";

export default async function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await auth();
  if (!user) return redirect("/");

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, user.activeTeamId),
    columns: {
      ownerId: true,
    },
  });

  if (team?.ownerId !== user.id) redirect("/team/settings");
  const t = await getTranslations();
  return (
    <div className="mt-8 space-y-6 md:mt-0">
      <div>
        <h2 className="text-center text-2xl font-bold md:text-left">
          {t("Permissions")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t(
            "settings.Define which role can make each action and define the roles of each member",
          )}
        </p>
      </div>
      <Suspense>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("Select your app to change its configurations")}
          </p>
          <AppSwitcher
            hrefPrefix="/team/settings/permissions/"
            hideAddMoreApps
            iconSize={28}
          />
        </div>
      </Suspense>
      {children}
    </div>
  );
}

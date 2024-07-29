import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { teams } from "@kdx/db/schema";
import { redirect } from "@kdx/locales/navigation";
import { getTranslations } from "@kdx/locales/server";

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
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense>
        <div className="space-y-3">
          <h1 className="text-lg font-bold">{t("Select your app")}</h1>
          <AppSwitcher
            hrefPrefix="/team/settings/roles/"
            hideAddMoreApps
            iconSize={28}
          />
        </div>
      </Suspense>
      {children}
    </div>
  );
}

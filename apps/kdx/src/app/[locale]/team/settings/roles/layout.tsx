import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";
import { getI18n } from "@kdx/locales/server";

import { AppSwitcher } from "~/app/[locale]/_components/app-switcher";
import { db } from "@kdx/db/client";

export default async function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const team = await db.query.teams.findFirst({
    where: eq(schema.teams.id, session.user.activeTeamId),
    columns: {
      ownerId: true,
    },
  });

  if (team?.ownerId !== session.user.id) redirect("/team/settings");
  const t = await getI18n();
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

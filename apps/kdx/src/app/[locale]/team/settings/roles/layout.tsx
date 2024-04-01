import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { db, eq, schema } from "@kdx/db";

import { AppSwitcher } from "~/app/[locale]/_components/app-switcher";

export default async function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/");
  // const team = await prisma.team.findUnique({
  //   where: {
  //     id: session.user.activeTeamId,
  //   },
  // });
  const team = await db.query.teams.findFirst({
    where: eq(schema.teams.id, session.user.activeTeamId),
    columns: {
      ownerId: true,
    },
  });

  if (team?.ownerId !== session.user.id) redirect("/team/settings");

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense>
        <div className="space-y-3">
          <h1 className="text-lg font-bold">Select your app</h1>
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

import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";

import { auth } from "@kdx/auth";

import { redirect } from "~/i18n/routing";
import SettingsEditCardSkeleton from "../../team/settings/general/_components/edit-team-name-card-skeleton";
import { AddTeamDialogButton } from "./_components/add-team-dialog-button/add-team-dialog-button";
import { DeleteAccountCard } from "./_components/delete-account-card";
import { EditAccountNameCard } from "./_components/edit-account-name-card";
import { EditUserTeamsTable } from "./_components/edit-users-teams-card/edit-users-teams-table";

export default async function GeneralAccountSettings() {
  const { user } = await auth();

  if (!user) return redirect({ href: "/", locale: await getLocale() });

  const t = await getTranslations();

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditAccountNameCard name={user.name} />
      </Suspense>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            {t("Teams")}
          </h3>
          <AddTeamDialogButton className="ml-auto max-w-fit" />
        </div>
        <Suspense fallback={<SettingsEditCardSkeleton />}>
          <EditUserTeamsTable />
        </Suspense>
      </div>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <DeleteAccountCard />
      </Suspense>
    </div>
  );
}

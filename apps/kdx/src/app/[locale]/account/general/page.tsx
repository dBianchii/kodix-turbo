import { Suspense } from "react";

import { auth } from "@kdx/auth";

import SettingsEditCardSkeleton from "~/app/[locale]/team/settings/general/_components/edit-team-name-card-skeleton";
import { EditAccountNameCard } from "./_components/edit-account-name-card";

export default async function GeneralAccountSettings() {
  const session = await auth();
  if (!session) return null;
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditAccountNameCard name={session.user.name} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import SettingsEditCardSkeleton from "~/app/[locale]/team/settings/general/_components/edit-team-name-card-skeleton";
import { EditAccountNameCard } from "./_components/edit-account-name-card";

export default async function GeneralAccountSettings() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditAccountNameCard name={session.user.name} />
      </Suspense>
    </div>
  );
}

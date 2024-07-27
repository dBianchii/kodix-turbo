import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/navigation";

import SettingsEditCardSkeleton from "../../team/settings/general/_components/edit-team-name-card-skeleton";
import { EditAccountNameCard } from "./_components/edit-account-name-card";

export default async function GeneralAccountSettings() {
  const { user } = await auth();
  if (!user) return redirect("/");

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditAccountNameCard name={user.name} />
      </Suspense>
    </div>
  );
}

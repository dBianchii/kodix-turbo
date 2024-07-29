import { Suspense } from "react";

import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/navigation";

import { EditTeamNameCard } from "./_components/edit-team-name-card";
import SettingsEditCardSkeleton from "./_components/edit-team-name-card-skeleton";

export default async function SettingsGeneralPage() {
  const { user } = await auth();
  if (!user) return redirect("/");
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditTeamNameCard />
      </Suspense>
    </div>
  );
}

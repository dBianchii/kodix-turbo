import { Suspense } from "react";

import { EditTeamNameCard } from "./_components/edit-team-name-card";
import SettingsEditCardSkeleton from "./_components/edit-team-name-card-skeleton";

export default function GeneralSettings() {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditTeamNameCard />
      </Suspense>
    </div>
  );
}

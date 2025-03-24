import { kodixCareAppId } from "@kdx/shared";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import DataTableKodixCare from "./_components/data-table-kodix-care";

export default async function KodixCarePage() {
  const user = await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  return (
    <main className="flex w-full flex-col gap-6 pl-4 pt-4 md:gap-1">
      <DataTableKodixCare user={user} />
    </main>
  );
}

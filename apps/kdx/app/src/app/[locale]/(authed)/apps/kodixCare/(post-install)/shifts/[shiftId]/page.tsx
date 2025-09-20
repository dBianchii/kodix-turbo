import { kodixCareAppId } from "@kodix/shared/db";

import { H1 } from "@kdx/ui/typography";

import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";

import { BackButton } from "./_components/back-button";

export default async function ShiftIdPage() {
  await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
  });

  return (
    <main className="pt-6 md:p-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <H1 className="text-muted">WIP</H1>
      </div>
    </main>
  );
}

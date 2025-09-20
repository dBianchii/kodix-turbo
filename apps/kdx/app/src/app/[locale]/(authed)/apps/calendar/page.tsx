import { calendarAppId } from "@kodix/shared/db";
import { getTranslations } from "next-intl/server";

import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";

import { CreateEventDialogButton } from "./_components/create-event-dialog";
import { DataTable } from "./_components/data-table-calendar";

export default async function CalendarPage() {
  await redirectIfAppNotInstalled({
    appId: calendarAppId,
  });

  const t = await getTranslations();
  return (
    <MaxWidthWrapper>
      <main className="pt-6">
        <div className="flex items-center space-x-4">
          <IconKodixApp appId={calendarAppId} renderText={false} />
          <H1>{t("Calendar")}</H1>
        </div>
        <Separator className="my-4" />
        <CreateEventDialogButton />
        <DataTable />
      </main>
    </MaxWidthWrapper>
  );
}

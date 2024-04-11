import dayjs from "@kdx/dayjs";
import { getI18n } from "@kdx/locales/server";
import { calendarAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/[locale]/_components/app/kodix-icon";
import { DataTable } from "~/app/[locale]/_components/apps/calendar/data-table";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import { CreateEventDialogButton } from "../../_components/apps/calendar/create-event-dialog";

export default async function CalendarPage() {
  const session = await redirectIfAppNotInstalled({
    appId: calendarAppId,
  });

  //date Start should be the beginninig of the day
  //date End should be the end of the day
  const data = await api.app.calendar.getAll({
    dateStart: dayjs.utc().startOf("day").toDate(),
    dateEnd: dayjs.utc().endOf("day").toDate(),
  });
  const t = await getI18n();
  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appId={calendarAppId} renderText={false} />
        <H1>{t("Calendar")}</H1>
      </div>
      <Separator className="my-4" />

      <CreateEventDialogButton />
      <DataTable data={data} session={session} />
    </MaxWidthWrapper>
  );
}

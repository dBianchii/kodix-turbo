import dayjs from "@kdx/dayjs";
import { prisma } from "@kdx/db";
import { calendarAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/_components/app/kodix-icon";
import { columns } from "~/app/_components/apps/calendar/columns";
import { CreateEventDialogButton } from "~/app/_components/apps/calendar/create-event-dialog";
import { DataTable } from "~/app/_components/apps/calendar/data-table";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";

export default async function Calendar() {
  const session = await redirectIfAppNotInstalled({
    appId: calendarAppId,
    prisma,
  });

  //date Start should be the beginninig of the day
  //date End should be the end of the day
  const data = await api.app.calendar.getAll({
    dateStart: dayjs.utc().startOf("day").toDate(),
    dateEnd: dayjs.utc().endOf("day").toDate(),
  });

  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appId={calendarAppId} renderText={false} />
        <H1>Calendar</H1>
      </div>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      <DataTable columns={columns} data={data} session={session} />
    </MaxWidthWrapper>
  );
}

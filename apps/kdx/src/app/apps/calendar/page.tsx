import { redirect } from "next/navigation";
import moment from "moment";

import { auth } from "@kdx/auth";
import { H1, Separator } from "@kdx/ui";

import { columns } from "~/app/_components/apps/calendar/columns";
import { CreateEventDialogButton } from "~/app/_components/apps/calendar/create-event-dialog";
import { DataTable } from "~/app/_components/apps/calendar/data-table";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function Calendar() {
  const session = await auth();
  if (!session) return redirect("/");

  //date Start should be the beginninig of the day
  //date End should be the end of the day
  const data = await api.event.getAll.query({
    dateStart: moment().utc().startOf("day").toDate(),
    dateEnd: moment().utc().endOf("day").toDate(),
  });

  return (
    <MaxWidthWrapper>
      <H1>Calendar</H1>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      <DataTable columns={columns} data={data} session={session} />
    </MaxWidthWrapper>
  );
}

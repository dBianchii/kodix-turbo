import { prisma } from "@kdx/db";
import { todoAppId } from "@kdx/shared";
import { Separator } from "@kdx/ui/separator";
import { H1 } from "@kdx/ui/typography";

import { IconKodixApp } from "~/app/_components/app/kodix-icon";
import { columns } from "~/app/_components/apps/todo/columns";
import { CreateTaskDialogButton } from "~/app/_components/apps/todo/create-task-dialog-button";
import { DataTable } from "~/app/_components/apps/todo/data-table";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";

export default async function Todo() {
  await redirectIfAppNotInstalled({
    appId: todoAppId,
    prisma,
  });

  const data = await api.app.todo.getAll();

  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appId={todoAppId} renderText={false} />
        <H1>Todo</H1>
      </div>
      <Separator className="my-4" />
      <CreateTaskDialogButton />
      <DataTable columns={columns} data={data ?? []} />
    </MaxWidthWrapper>
  );
}

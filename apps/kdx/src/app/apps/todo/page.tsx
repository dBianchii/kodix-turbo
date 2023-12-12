"use client";

import { H1, Separator } from "@kdx/ui";

import { IconKodixApp } from "~/app/_components/app/kodix-app";
import { columns } from "~/app/_components/apps/todo/columns";
import { CreateTaskDialogButton } from "~/app/_components/apps/todo/create-task-dialog-button";
import { DataTable } from "~/app/_components/apps/todo/data-table";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/react";

export default function Todo() {
  const { data } = api.todo.getAll.useQuery();

  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appName="Todo" appUrl="/todo" renderText={false} />
        <H1>Todo</H1>
      </div>
      <Separator className="my-4" />
      <CreateTaskDialogButton />
      <DataTable columns={columns} data={data ?? []} />
    </MaxWidthWrapper>
  );
}

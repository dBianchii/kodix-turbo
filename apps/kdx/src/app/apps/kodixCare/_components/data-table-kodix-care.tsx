"use client";

import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type { FixedColumnsType } from "@kdx/ui/data-table";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { DataTable } from "@kdx/ui/data-table";

import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<
    RouterOutputs["app"]["kodixCare"]["getCareTasks"][number]
  >();

export default function DataTableKodixCare({
  initialCareTasks,
  input,
}: {
  initialCareTasks: RouterOutputs["app"]["kodixCare"]["getCareTasks"];
  input: TGetCareTasksInputSchema;
}) {
  const { data } = api.app.kodixCare.getCareTasks.useQuery(input, {
    refetchOnMount: false,
    initialData: initialCareTasks,
  });

  const columns = [
    columnHelper.accessor("title", {
      header: () => <div className="pl-2">Title</div>,
      cell: (info) => <span className="pl-2 ">{info.getValue()}</span>,
    }),
    columnHelper.accessor("description", {
      header: () => <div>Description</div>,
      cell: (info) => <p className="">{info.getValue()}</p>,
    }),
    columnHelper.accessor("eventDate", {
      header: () => <div>Date and time</div>,
      cell: (info) => (
        <div className="flex w-60 flex-row gap-3 pl-2">
          <div className="flex flex-col items-start">
            <span className="">
              {dayjs(info.getValue()).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
        </div>
      ),
    }),
  ] as FixedColumnsType<
    RouterOutputs["app"]["kodixCare"]["getCareTasks"][number]
  >;

  return <DataTable columns={columns} data={data} />;
}

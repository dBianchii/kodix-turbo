"use client";

import { use, useMemo } from "react";
import { RxCrossCircled } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { DataTableFilterField } from "@kdx/ui/data-table/advanced/types";
import type { FixedColumnsType } from "@kdx/ui/data-table/data-table";
import { schema } from "@kdx/db/schema";
import { DataTableAdvancedToolbar } from "@kdx/ui/data-table/advanced/data-table-advanced-toolbar";
import { DataTable } from "@kdx/ui/data-table/data-table";

import { getColumns } from "./data-table-notifications-columns";
import { DataTableNotificationsToolbarActions } from "./data-table-notifications-toolbar-actions";
import { useDataTable } from "./hooks";

export function DataTableNotifications({
  notificationsPromise,
}: {
  notificationsPromise: Promise<RouterOutputs["user"]["getNotifications"]>;
}) {
  const { data, pageCount } = use(notificationsPromise);

  const columns = useMemo(
    () =>
      getColumns() as FixedColumnsType<
        RouterOutputs["user"]["getNotifications"]["data"][number]
      >,
    [],
  );

  const filterFields: DataTableFilterField<
    RouterOutputs["user"]["getNotifications"]["data"][number]
  >[] = [
    {
      label: "Message",
      value: "message",
      placeholder: "Filter titles...",
    },
    {
      label: "Channel",
      value: "channel",
      options: schema.notifications.channel.enumValues.map((channel) => ({
        label: channel[0]?.toUpperCase() + channel.slice(1),
        value: channel,
        icon: RxCrossCircled,
        withCount: true,
      })),
    },
    {
      label: "Read",
      value: "read",
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    // optional props
    filterFields,
    defaultPerPage: 10,
    defaultSort: "sentAt.desc",
  });

  return (
    <div>
      <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
        {/* <TasksTableToolbarActions table={table} /> */}
        <DataTableNotificationsToolbarActions table={table} />
      </DataTableAdvancedToolbar>
      <DataTable table={table} />
    </div>
  );
}

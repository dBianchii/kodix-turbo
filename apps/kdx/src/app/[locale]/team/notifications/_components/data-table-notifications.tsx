"use client";

import { use, useMemo } from "react";
import { MdEmail } from "react-icons/md";

import type { RouterOutputs } from "@kdx/api";
import type { DataTableFilterField } from "@kdx/ui/data-table/advanced/types";
import type { FixedColumnsType } from "@kdx/ui/data-table/data-table";
import { schema } from "@kdx/db/schema";
import { useI18n } from "@kdx/locales/client";
import { DataTableAdvancedToolbar } from "@kdx/ui/data-table/advanced/data-table-advanced-toolbar";
import { DataTable } from "@kdx/ui/data-table/data-table";

import { useDataTable } from "../_hooks/useDataTable";
import { getColumns } from "./data-table-notifications-columns";
import { DataTableNotificationsFloatingBar } from "./data-table-notifications-floating-bar";
import { DataTableNotificationsToolbarActions } from "./data-table-notifications-toolbar-actions";

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

  const t = useI18n();

  const filterFields: DataTableFilterField<
    RouterOutputs["user"]["getNotifications"]["data"][number]
  >[] = [
    {
      label: t("Subject"),
      value: "subject",
      placeholder: t("Filter subjects"),
    },
    {
      label: t("Channel"),
      value: "channel",
      options: schema.notifications.channel.enumValues.map((channel) => ({
        label: channel[0]?.toUpperCase() + channel.slice(1),
        value: channel,
        icon: MdEmail,
        withCount: true,
      })),
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
      <DataTable
        table={table}
        floatingBar={<DataTableNotificationsFloatingBar table={table} />}
      />
    </div>
  );
}

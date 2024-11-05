"use client";

import { use, useMemo } from "react";
import { useTranslations } from "next-intl";
import { MdEmail } from "react-icons/md";

import type { RouterOutputs } from "@kdx/api";
import type { FixedColumnsType } from "@kdx/ui/data-table/data-table";
import { notifications } from "@kdx/db/schema";
import { DataTable } from "@kdx/ui/data-table/data-table";

import type { DataTableFilterField } from "./data-table-advanced/types";
import { useDataTable } from "../_hooks/useDataTable";
import { DataTableAdvancedToolbar } from "./data-table-advanced/data-table-advanced-toolbar";
import { getColumns } from "./data-table-notifications-columns";
import { DataTableNotificationsFloatingBar } from "./data-table-notifications-floating-bar";
import { DataTableNotificationsToolbarActions } from "./data-table-notifications-toolbar-actions";

export function DataTableNotifications({
  notificationsPromise,
  allTeamsPromise,
}: {
  notificationsPromise: Promise<RouterOutputs["user"]["getNotifications"]>;
  allTeamsPromise: Promise<RouterOutputs["team"]["getAll"]>;
}) {
  const { data, pageCount } = use(notificationsPromise);
  const teams = use(allTeamsPromise);

  const columns = useMemo(
    () =>
      getColumns() as FixedColumnsType<
        RouterOutputs["user"]["getNotifications"]["data"][number]
      >,
    [],
  );

  const t = useTranslations();

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
      options: notifications.channel.enumValues.map((channel) => ({
        label: channel[0]?.toUpperCase() + channel.slice(1),
        value: channel,
        icon: MdEmail,
        withCount: true,
      })),
    },
    {
      label: t("Team"),
      value: "teamId",
      options: teams.map((team) => ({
        label: team.name,
        value: team.id,
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

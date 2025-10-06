"use client";

import type { FixedColumnsType } from "@kodix/ui/data-table/data-table";
import { use, useMemo } from "react";
import { DataTable } from "@kodix/ui/data-table/data-table";
import { useTranslations } from "next-intl";
import { MdEmail } from "react-icons/md";

import type { RouterOutputs } from "@kdx/api";
import { notifications } from "@kdx/db/schema";

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
  const t = useTranslations();

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
      label: t("Subject"),
      placeholder: t("Filter subjects"),
      value: "subject",
    },
    {
      label: t("Channel"),
      options: notifications.channel.enumValues.map((channel) => ({
        icon: MdEmail,
        label: channel[0]?.toUpperCase() + channel.slice(1),
        value: channel,
        withCount: true,
      })),
      value: "channel",
    },
    {
      label: t("Team"),
      options: teams.map((team) => ({
        label: team.name,
        value: team.id,
        withCount: true,
      })),
      value: "teamId",
    },
  ];

  const { table } = useDataTable({
    columns,
    data,
    defaultPerPage: 10,
    defaultSort: "sentAt.desc",
    // optional props
    filterFields,
    pageCount,
  });

  return (
    <div>
      <DataTableAdvancedToolbar filterFields={filterFields} table={table}>
        {/* <TasksTableToolbarActions table={table} /> */}
        <DataTableNotificationsToolbarActions table={table} />
      </DataTableAdvancedToolbar>
      <DataTable
        floatingBar={<DataTableNotificationsFloatingBar table={table} />}
        table={table}
      />
    </div>
  );
}

"use client";

import { use, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import type { RouterOutputs } from "@kdx/api";
import { DataTable } from "@kdx/ui/data-table/data-table";
import { DataTableColumnHeader } from "@kdx/ui/data-table/data-table-column-header";

const columnHelper =
  createColumnHelper<RouterOutputs["app"]["getAppActivityLogs"]>();
const useTable = (
  appActivityLogsPromise: RouterOutputs["app"]["getAppActivityLogs"],
) => {
  const t = useTranslations();

  const columns = useMemo(
    () => [
      columnHelper.accessor("tableName", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Title")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return <></>;
        },
      }),
    ],
    [],
  );
};

export function DataTableKodixCareLogs({
  appActivityLogsPromise,
}: {
  appActivityLogsPromise: Promise<RouterOutputs["app"]["getAppActivityLogs"]>;
}) {
  useTable(use(appActivityLogsPromise));

  return <DataTable></DataTable>;
}

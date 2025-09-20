"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@kodix/ui/button";
import { exportTableToCSV } from "@kodix/ui/data-table/export";
import { useTranslations } from "next-intl";
import { LuDownload } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";

interface TasksTableToolbarActionsProps {
  table: Table<RouterOutputs["user"]["getNotifications"]["data"][number]>;
}

export function DataTableNotificationsToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "tasks",
            excludeColumns: ["select", "actions"],
          })
        }
      >
        <LuDownload className="mr-2 size-4" aria-hidden="true" />
        {t("Export")}
      </Button>
      {/**
       * Other actions can be added here.
       * For example, export, import, etc.
       */}
    </div>
  );
}

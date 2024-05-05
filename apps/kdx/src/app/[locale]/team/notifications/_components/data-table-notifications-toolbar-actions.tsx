"use client";

import type { Table } from "@tanstack/react-table";
import { RxDownload } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { useI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import { exportTableToCSV } from "@kdx/ui/data-table/export";

interface TasksTableToolbarActionsProps {
  table: Table<RouterOutputs["user"]["getNotifications"]["data"][number]>;
}

export function DataTableNotificationsToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  const t = useI18n();
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
        <RxDownload className="mr-2 size-4" aria-hidden="true" />
        {t("Export")}
      </Button>
      {/**
       * Other actions can be added here.
       * For example, export, import, etc.
       */}
    </div>
  );
}

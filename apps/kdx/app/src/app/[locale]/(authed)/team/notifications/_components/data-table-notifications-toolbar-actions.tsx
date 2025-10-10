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
        onClick={() =>
          exportTableToCSV(table, {
            excludeColumns: ["select", "actions"],
            filename: "tasks",
          })
        }
        size="sm"
        variant="outline"
      >
        <LuDownload aria-hidden="true" className="mr-2 size-4" />
        {t("Export")}
      </Button>
      {/**
       * Other actions can be added here.
       * For example, export, import, etc.
       */}
    </div>
  );
}

import type { Table } from "@tanstack/react-table";
import * as React from "react";
import { RxCross2, RxDownload, RxReload, RxTrash } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { getErrorMessage } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import { exportTableToCSV } from "@kdx/ui/data-table/export";
import { Kbd } from "@kdx/ui/kbd";
import { Separator } from "@kdx/ui/separator";
import { toast } from "@kdx/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

import { deleteNotificationsAction } from "../_actions/deleteNotificationsAction";

interface DataTableNotificationsFloatingBarProps {
  table: Table<RouterOutputs["user"]["getNotifications"]["data"][number]>;
}

export function DataTableNotificationsFloatingBar({
  table,
}: DataTableNotificationsFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const [isPending, startTransition] = React.useTransition();
  const [method, setMethod] = React.useState<"export" | "delete">();

  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [table]);

  const t = useTranslations();

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit px-4">
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-card p-2 shadow-2xl">
          <div className="flex h-7 items-center rounded-md border border-dashed pl-2.5 pr-1">
            <span className="whitespace-nowrap text-xs">
              {rows.length} {t("selected")}
            </span>
            <Separator orientation="vertical" className="ml-2 mr-1" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 hover:border"
                    onClick={() => table.toggleAllRowsSelected(false)}
                  >
                    <RxCross2
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900">
                  <p className="mr-2">{t("Clear selection")}</p>
                  <Kbd abbrTitle="Escape" variant="outline">
                    Esc
                  </Kbd>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7 border"
                    onClick={() => {
                      setMethod("export");

                      startTransition(() => {
                        exportTableToCSV(table, {
                          excludeColumns: ["select", "actions"],
                          onlySelected: true,
                        });
                      });
                    }}
                    disabled={isPending}
                  >
                    {isPending && method === "export" ? (
                      <RxReload
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <RxDownload className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className=" border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>{t("Export notifications")}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7 border"
                    onClick={() => {
                      setMethod("delete");

                      startTransition(() => {
                        toast.promise(
                          deleteNotificationsAction({
                            ids: rows.map((row) => row.original.id),
                          }),
                          {
                            error: getErrorMessage,
                            loading: "Deleting",
                            success: () => {
                              table.toggleAllRowsSelected(false);
                              return "Notifications deleted";
                            },
                          },
                        );
                      });
                    }}
                    disabled={isPending}
                  >
                    {isPending && method === "delete" ? (
                      <RxReload
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <RxTrash className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className=" border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>{t("Delete notifications")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

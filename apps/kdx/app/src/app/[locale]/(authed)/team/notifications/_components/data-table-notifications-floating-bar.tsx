import type { Table } from "@tanstack/react-table";
import { useEffect, useState, useTransition } from "react";
import { getErrorMessage } from "@kodix/shared/utils";
import { Button } from "@kodix/ui/button";
import { exportTableToCSV } from "@kodix/ui/common/data-table/export";
import { Kbd } from "@kodix/ui/kbd";
import { Separator } from "@kodix/ui/separator";
import { toast } from "@kodix/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kodix/ui/tooltip";
import { useTranslations } from "next-intl";
import { LuDownload, LuRotateCw, LuTrash, LuX } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";

import { deleteNotificationsAction } from "../_actions/delete-notifications.action";

interface DataTableNotificationsFloatingBarProps {
  table: Table<RouterOutputs["user"]["getNotifications"]["data"][number]>;
}

export function DataTableNotificationsFloatingBar({
  table,
}: DataTableNotificationsFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<"export" | "delete">();

  // Clear selection on Escape key press
  useEffect(() => {
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
          <div className="flex h-7 items-center rounded-md border border-dashed pr-1 pl-2.5">
            <span className="whitespace-nowrap text-xs">
              {rows.length} {t("selected")}
            </span>
            <Separator className="mr-1 ml-2" orientation="vertical" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="size-5 hover:border"
                    onClick={() => table.toggleAllRowsSelected(false)}
                    size="icon"
                    variant="ghost"
                  >
                    <LuX aria-hidden="true" className="size-3.5 shrink-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900">
                  <p className="mr-2">{t("Clear selection")}</p>
                  <Kbd>
                    Esc
                  </Kbd>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator className="hidden h-5 sm:block" orientation="vertical" />
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <Button
                    className="size-7 border"
                    disabled={isPending}
                    onClick={() => {
                      setMethod("export");

                      startTransition(() => {
                        exportTableToCSV(table, {
                          excludeColumns: ["select", "actions"],
                          onlySelected: true,
                        });
                      });
                    }}
                    size="icon"
                    variant="secondary"
                  >
                    {isPending && method === "export" ? (
                      <LuRotateCw
                        aria-hidden="true"
                        className="size-3.5 animate-spin"
                      />
                    ) : (
                      <LuDownload aria-hidden="true" className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>{t("Export notifications")}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <Button
                    className="size-7 border"
                    disabled={isPending}
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
                    size="icon"
                    variant="secondary"
                  >
                    {isPending && method === "delete" ? (
                      <LuRotateCw
                        aria-hidden="true"
                        className="size-3.5 animate-spin"
                      />
                    ) : (
                      <LuTrash aria-hidden="true" className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
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

import type { Table } from "@tanstack/react-table";
import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { LuDownload, LuRotateCw, LuTrash, LuX } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
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
        <div className="bg-card mx-auto flex w-fit items-center gap-2 rounded-md border p-2 shadow-2xl">
          <div className="flex h-7 items-center rounded-md border border-dashed pr-1 pl-2.5">
            <span className="text-xs whitespace-nowrap">
              {rows.length} {t("selected")}
            </span>
            <Separator orientation="vertical" className="mr-1 ml-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 hover:border"
                    onClick={() => table.toggleAllRowsSelected(false)}
                  >
                    <LuX className="size-3.5 shrink-0" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-accent text-foreground flex items-center border px-2 py-1 font-semibold dark:bg-zinc-900">
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
                      <LuRotateCw
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <LuDownload className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-accent text-foreground border font-semibold dark:bg-zinc-900">
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
                      <LuRotateCw
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <LuTrash className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-accent text-foreground border font-semibold dark:bg-zinc-900">
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

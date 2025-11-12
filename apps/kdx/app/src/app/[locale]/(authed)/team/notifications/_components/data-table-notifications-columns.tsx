import { useState } from "react";
import { Button } from "@kodix/ui/button";
import { Checkbox } from "@kodix/ui/checkbox";
import { DataTableColumnHeader } from "@kodix/ui/common/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { createColumnHelper } from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";
import { LuExternalLink } from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";

import { Link } from "~/i18n/routing";

import { DeleteNotificationsDialog } from "./delete-notifications-dialog";

const columnHelper =
  createColumnHelper<
    RouterOutputs["user"]["getNotifications"]["data"][number]
  >();

export function getColumns() {
  return [
    columnHelper.display({
      cell({ row }) {
        const t = useTranslations();

        return (
          <Checkbox
            aria-label={t("Select row")}
            checked={row.getIsSelected()}
            className="translate-y-0.5"
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        );
      },
      enableHiding: false,
      enableSorting: false,
      header({ table }) {
        const t = useTranslations();
        return (
          <Checkbox
            aria-label={t("Select all")}
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            className="translate-y-0.5"
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        );
      },
      id: "select",
    }),
    columnHelper.accessor("subject", {
      cell: ({ row }) => <div className="w-20">{row.original.subject}</div>,
      enableHiding: false,
      enableSorting: false,
      header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Subject")}
          </DataTableColumnHeader>
        );
      },
    }),
    columnHelper.accessor("channel", {
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="capitalize">{row.original.channel}</span>
        </div>
      ),
      filterFn: (row, id, value) =>
        Array.isArray(value) && value.includes(row.getValue(id)),
      header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Channel")}
          </DataTableColumnHeader>
        );
      },
    }),
    columnHelper.accessor("sentAt", {
      cell({ cell }) {
        const format = useFormatter();
        return format.dateTime(cell.row.original.sentAt, "extensive");
      },
      header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Sent at")}
          </DataTableColumnHeader>
        );
      },
    }),
    columnHelper.accessor("teamId", {
      cell({ row }) {
        return <div className="w-20">{row.original.teamName}</div>;
      },
      header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Team")}
          </DataTableColumnHeader>
        );
      },
    }),
    columnHelper.display({
      cell({ row }) {
        const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false);
        const t = useTranslations();
        return (
          <>
            {/* <UpdateTaskSheet
              open={showUpdateTaskSheet}
              onOpenChange={setShowUpdateTaskSheet}
              task={row.original}
            /> */}

            <DeleteNotificationsDialog
              notifications={[row]}
              onOpenChange={setShowDeleteTaskDialog}
              open={showDeleteTaskDialog}
              showTrigger={false}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                  variant="ghost"
                >
                  <RxDotsHorizontal aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <Link
                  href={`/team/notifications/preview-email/${row.original.id}`}
                  target="_blank"
                >
                  <DropdownMenuItem>
                    {t("View")} <LuExternalLink className="size-6 pl-2" />
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => setShowDeleteTaskDialog(true)}
                >
                  {t("Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
      id: "actions",
    }),
  ];
}

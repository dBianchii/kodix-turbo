import { useState } from "react";
import { Button } from "@kodix/ui/button";
import { Checkbox } from "@kodix/ui/checkbox";
import { DataTableColumnHeader } from "@kodix/ui/data-table/data-table-column-header";
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
      id: "select",
      header: function Header({ table }) {
        const t = useTranslations();
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("Select all")}
          className="translate-y-0.5"
        />;
      },
      cell: function Cell({ row }) {
        const t = useTranslations();

        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("Select row")}
            className="translate-y-0.5"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("subject", {
      header: function Header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Subject")}
          </DataTableColumnHeader>
        );
      },
      cell: ({ row }) => <div className="w-20">{row.original.subject}</div>,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("channel", {
      header: function Header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Channel")}
          </DataTableColumnHeader>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="capitalize">{row.original.channel}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    }),
    columnHelper.accessor("sentAt", {
      header: function Header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Sent at")}
          </DataTableColumnHeader>
        );
      },
      cell: function Cell({ cell }) {
        const format = useFormatter();
        return format.dateTime(cell.row.original.sentAt, "extensive");
      },
    }),
    columnHelper.accessor("teamId", {
      header: function Header({ column }) {
        const t = useTranslations();
        return (
          <DataTableColumnHeader column={column}>
            {t("Team")}
          </DataTableColumnHeader>
        );
      },
      cell: function Cell({ row }) {
        return <div className="w-20">{row.original.teamName}</div>;
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: function Cell({ row }) {
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
              open={showDeleteTaskDialog}
              onOpenChange={setShowDeleteTaskDialog}
              notifications={[row]}
              showTrigger={false}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <RxDotsHorizontal className="size-4" aria-hidden="true" />
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
                  onSelect={() => setShowDeleteTaskDialog(true)}
                  className="text-destructive"
                >
                  {t("Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    }),
  ];
}

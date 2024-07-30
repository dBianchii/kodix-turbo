import React from "react";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { RxDotsHorizontal, RxExternalLink } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { useFormatter } from "@kdx/locales";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
import { DataTableColumnHeader } from "@kdx/ui/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";

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
        return <DataTableColumnHeader column={column} title={t("Subject")} />;
      },
      cell: ({ row }) => <div className="w-20">{row.original.subject}</div>,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("channel", {
      header: function Header({ column }) {
        const t = useTranslations();
        return <DataTableColumnHeader column={column} title={t("Channel")} />;
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
        return <DataTableColumnHeader column={column} title={t("Sent at")} />;
      },
      cell: function Cell({ cell }) {
        const format = useFormatter();
        return format.dateTime(cell.row.original.sentAt, {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
      },
    }),
    columnHelper.accessor("teamId", {
      header: function Header({ column }) {
        const t = useTranslations();
        return <DataTableColumnHeader column={column} title={t("Team")} />;
      },
      cell: function Cell({ row }) {
        return <div className="w-20">{row.original.teamName}</div>;
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: function Cell({ row }) {
        const [showDeleteTaskDialog, setShowDeleteTaskDialog] =
          React.useState(false);
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
                    {t("View")} <RxExternalLink className="size-6 pl-2" />
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

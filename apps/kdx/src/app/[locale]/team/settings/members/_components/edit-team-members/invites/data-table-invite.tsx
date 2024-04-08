"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { useI18n } from "@kdx/locales/client";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<RouterOutputs["team"]["invitation"]["getAll"][number]>();

export function InviteDataTable() {
  const { data } = api.team.invitation.getAll.useQuery();
  const t = useI18n();
  const utils = api.useUtils();
  const { mutate } = api.team.invitation.delete.useMutation({
    onSuccess: () => {
      toast.success(t("Invite deleted"));
      void utils.team.invitation.getAll.invalidate();
    },
  });

  const columns = [
    columnHelper.accessor("inviteEmail", {
      header: (info) => {
        return (
          <div className="flex items-center space-x-8">
            <Checkbox
              checked={info.table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                info.table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
            <div className="text-muted-foreground">{t("Select all")}</div>
          </div>
        );
      },
      cell: (info) => (
        <div className="flex flex-row space-x-8">
          <div className="flex flex-col items-center justify-center">
            <Checkbox
              checked={info.row.getIsSelected()}
              onCheckedChange={(value) => info.row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
          <div className="flex flex-col">
            <AvatarWrapper className="h-8 w-8" fallback={info.getValue()} />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold">
              {info.cell.row.original.inviteEmail}
            </span>
            <span className="text-muted-foreground">{info.getValue()}</span>
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: true,
    }),
    columnHelper.accessor("inviteId", {
      header: () => null,
      cell: (info) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("Open menu")}</span>
                  <RxDotsHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => {
                    mutate({
                      invitationId: info.row.original.inviteId,
                    });
                  }}
                >
                  {t("Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("No invitations right now")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

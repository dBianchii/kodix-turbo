"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import { useI18n } from "@kdx/locales/client";
import { getErrorMessage } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
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
  createColumnHelper<RouterOutputs["team"]["getAllUsers"][number]>();

export function DataTableMembers({ user }: { user: User }) {
  const [data, query] = api.team.getAllUsers.useSuspenseQuery(undefined);

  const utils = api.useUtils();
  const t = useI18n();
  const mutation = api.team.removeUser.useMutation();

  const columns = [
    columnHelper.accessor("name", {
      header: () => <div className="ml-2">User</div>,
      cell: (info) => (
        <div className="ml-2 flex flex-row gap-4">
          <div className="flex flex-col">
            <AvatarWrapper
              className="h-8 w-8"
              src={info.cell.row.original.image ?? ""}
              fallback={info.getValue()}
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold">{info.cell.row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {info.cell.row.original.email}
            </span>
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: true,
    }),
    columnHelper.display({
      id: "actions",
      cell: function Cell(info) {
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
                    toast.promise(
                      mutation.mutateAsync({ userId: info.row.original.id }),
                      {
                        loading: `${t("Removing user")}`,
                        success: () => {
                          void utils.team.getAllUsers.invalidate();
                          return t("apps.kodixCare.Task updated");
                        },
                        error: (err) => {
                          return getErrorMessage(err);
                        },
                      },
                    );
                  }}
                >
                  {info.row.original.id === user.id ? t("Leave") : t("Remove")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 1,
    },
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
          {query.isFetching ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("Loading")}...
              </TableCell>
            </TableRow>
          ) : query.isError ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("An error occurred")}
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
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
                {t("No members found")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

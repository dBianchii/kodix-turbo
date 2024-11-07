"use client";

import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";
import { LuCheck, LuLock, LuText } from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import { Link } from "@kdx/locales/next-intl/navigation";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { DataTableColumnHeader } from "@kdx/ui/data-table/data-table-column-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<
    RouterOutputs["app"]["kodixCare"]["getAllCareShifts"][number]
  >();

export function DataTableShifts({
  initialShifts,
}: {
  initialShifts: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"];
}) {
  const t = useTranslations();
  const format = useFormatter();
  const [open, setOpen] = useState(false);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "Shift ended",
        header: () => null,
        cell: (ctx) => {
          if (ctx.row.original.checkOut) return <LuLock />;
          return null;
        },
      }),
      columnHelper.accessor("checkIn", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            <LuCheck className="mr-2 size-4 text-green-400" />
            {t("Check in")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <div className="w-8"></div>
              <span className="font-semibold">
                {format.dateTime(ctx.row.original.checkIn, "shortWithHours")}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("checkOut", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Check out")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <span className="font-semibold">
                {ctx.row.original.checkOut
                  ? format.dateTime(ctx.row.original.checkOut, "shortWithHours")
                  : null}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("shiftEndedAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Shift ended at")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <span className="font-semibold">
                {ctx.row.original.shiftEndedAt
                  ? format.dateTime(
                      ctx.row.original.shiftEndedAt,
                      "shortWithHours",
                    )
                  : null}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("caregiverId", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Caregiver")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center gap-2">
              <AvatarWrapper
                className="size-6"
                fallback={ctx.row.original.Caregiver.name}
                src={ctx.row.original.Caregiver.image ?? ""}
              />
              <span className="text-muted-foreground">
                {ctx.row.original.Caregiver.name}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "Notes",
        header: () => null,
        cell: (ctx) => {
          if (ctx.row.original.notes)
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LuText className="mr-2 size-4 text-orange-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs truncate">
                      {ctx.row.original.notes}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          return;
        },
      }),
    ],
    [format, t],
  );

  const query = api.app.kodixCare.getAllCareShifts.useQuery(undefined, {
    initialData: initialShifts,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data: query.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <>
      <div
        className="w-full space-y-2.5 overflow-auto"
        style={{
          width: "100%;",
        }}
      >
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
                  <Link
                    href={`/apps/kodixCare/shifts/${row.original.id}`}
                    passHref
                    legacyBehavior
                  >
                    <TableRow
                      role="link"
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </Link>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    {t("No results found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

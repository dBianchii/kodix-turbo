"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { Session } from "@kdx/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";
import { memberColumns } from "./memberColumns";

export function DataTableMembers({ session }: { session: Session }) {
  const [data] = api.team.getAllUsers.useSuspenseQuery();

  const utils = api.useUtils();
  const { mutate } = api.team.removeUser.useMutation({
    onSuccess: () => {
      toast("User removed from team");
      void utils.team.getAllUsers.invalidate();
    },
    onError: (e) => trpcErrorToastDefault(e),
  });

  const columns = memberColumns({ mutate, session });
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
          {table.getRowModel().rows?.length ? (
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

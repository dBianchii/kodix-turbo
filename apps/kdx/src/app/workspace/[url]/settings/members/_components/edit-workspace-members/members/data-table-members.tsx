"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@kdx/ui";

import { api } from "~/trpc/react";
import { memberColumns } from "./memberColumns";

export function DataTableMembers({
  initialUsers,
  session,
}: {
  initialUsers: RouterOutputs["workspace"]["getAllUsers"];
  session: Session;
}) {
  const { data } = api.workspace.getAllUsers.useQuery(undefined, {
    initialData: initialUsers,
  });

  const utils = api.useUtils();
  const { mutate } = api.workspace.removeUser.useMutation({
    onSuccess: () => {
      toast("User removed from workspace");
      void utils.workspace.getAllUsers.invalidate();
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors;
      if (errorMessage?.workspaceName)
        return toast.error(errorMessage?.workspaceName[0]);
      toast.error(
        error.message || "Oops, something went wrong. Please try again later",
      );
    },
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

"use client";

import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import { useI18n } from "@kdx/locales/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { DataTablePagination } from "./data-table-pagination";

/**https://github.com/shadcn-ui/ui/issues/346#issuecomment-1908758526 */
export type FixedColumnsType<T> = ColumnDef<T, unknown>[]; //? Using this while it is not fixed
interface DataTableProps<TData> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>;

  noResultsMessage?: string;
}

export function DataTable<TData>({
  table,
  noResultsMessage,
  onClickRow,
}: DataTableProps<TData> & {
  noResultsMessage?: string;
  onClickRow?: () => void;
}) {
  const t = useI18n();
  noResultsMessage = noResultsMessage ?? t("No results found");

  return (
    <div className="w-full space-y-2.5 overflow-auto">
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
                  onClick={onClickRow}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

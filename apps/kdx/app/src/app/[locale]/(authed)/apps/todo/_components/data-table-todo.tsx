"use client";

import type { ColumnFiltersState, RowData } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button } from "@kodix/ui/button";
import { Checkbox } from "@kodix/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@kodix/ui/context-menu";
import { DataTablePagination } from "@kodix/ui/data-table/data-table-pagination";
import { Input } from "@kodix/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@kodix/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type { todos } from "@kdx/db/schema";
import { useTRPC } from "@kdx/api/trpc/react/client";

import { DatePickerWithPresets } from "~/app/[locale]/_components/date-picker-with-presets";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

import type { Priority } from "./priority-popover";
import { AssigneePopover } from "./assignee-popover";
import { CreateTaskDialogButton } from "./create-task-dialog-button";
import {
  PriorityIcon,
  PriorityPopover,
  PriorityToTxt,
} from "./priority-popover";
import { StatusIcon, StatusPopover, StatusToText } from "./status-popover";

export type TodoColumn = RouterOutputs["app"]["todo"]["getAll"][number];
const columnHelper = createColumnHelper<TodoColumn>();
type team = RouterOutputs["team"]["getActiveTeam"];

type Status = typeof todos.$inferInsert.status;

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: <idk>
  interface TableMeta<TData extends RowData> {
    team: team | undefined;
  }
}

export function DataTableTodo({
  initialData,
}: {
  initialData: RouterOutputs["app"]["todo"]["getAll"];
}) {
  const trpc = useTRPC();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const { data: team } = api.team.getActiveTeam.useQuery();
  // const team = {
  //   Users: [{ id: "THIS_WAS_REMOVED_LOL", name: "asdas", image: "asd" }],
  // };

  const todosQuery = useQuery(
    trpc.app.todo.getAll.queryOptions(undefined, {
      initialData,
    }),
  );

  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("priority", {
      cell: function Cell(info) {
        const [priority, setPriority] = useState<Priority>(0); //added "0" Just to make TS happy

        const value = info.getValue() as Priority;
        useEffect(() => {
          if (value) setPriority(value);
        }, [value]);

        const queryClient = useQueryClient();
        const { mutate: updateTodo } = useMutation(
          trpc.app.todo.update.mutationOptions({
            async onMutate(newData) {
              if (!newData.priority) return;

              // Cancel outgoing fetches (so they don't overwrite our optimistic update)
              await queryClient.cancelQueries(
                trpc.app.todo.getAll.pathFilter(),
              );

              // Get the previous data, so we can rollback later
              const prevData = priority;
              // Optimistically update to the new value
              setPriority(newData.priority as Priority);
              return { prevData };
            },
            onError(err, _newTodo, ctx) {
              if (!ctx?.prevData) return;

              trpcErrorToastDefault(err);
              // If the mutation fails, use the context-value from onMutate
              setPriority(ctx.prevData);
            },
          }),
        );

        function handlePriorityChange(newPriority: Priority) {
          updateTodo({ id: info.row.original.id, priority: newPriority });
        }

        return (
          <div className="text-left">
            <PriorityPopover
              priority={priority}
              setPriority={handlePriorityChange}
            >
              <Button variant="ghost" size="sm">
                <PriorityIcon priority={priority} className="mr-2" />
                {PriorityToTxt(priority)}
                <span className="sr-only">Open priority popover</span>
              </Button>
            </PriorityPopover>
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      cell: function Cell(info) {
        const [status, setStatus] = useState<Status>("TODO"); //added "TODO" Just to make TS happy

        const value = info.getValue();
        useEffect(() => {
          if (value) setStatus(value);
        }, [value]);

        const queryClient = useQueryClient();

        const { mutate: updateTodo } = useMutation(
          trpc.app.todo.update.mutationOptions({
            async onMutate(newData) {
              if (!newData.status) return;

              // Cancel outgoing fetches (so they don't overwrite our optimistic update)
              await queryClient.cancelQueries(
                trpc.app.todo.getAll.pathFilter(),
              );

              // Get the previous data, so we can rollback later
              const prevData = status;
              // Optimistically update to the new value
              setStatus(newData.status);
              return { prevData };
            },
            onError(err, _newTodo, ctx) {
              if (!ctx?.prevData) return;

              trpcErrorToastDefault(err);
              // If the mutation fails, use the context-value from onMutate
              setStatus(ctx.prevData);
            },
          }),
        );

        function handleStatusChange(newStatus: Status) {
          updateTodo({ id: info.row.original.id, status: newStatus });
        }

        const statusTxt = StatusToText(status);

        return (
          <StatusPopover setStatus={handleStatusChange} status={status}>
            <Button variant="ghost" size="sm">
              <StatusIcon status={status} className={"mr-2"} />
              {statusTxt}
              <span className="sr-only">Open status popover</span>
            </Button>
          </StatusPopover>
        );
      },
    }),
    columnHelper.accessor("title", {
      cell: (info) => <div className="font-bold">{info.getValue()}</div>,
    }),
    columnHelper.accessor("dueDate", {
      cell: function Cell(info) {
        const [dueDate, setDueDate] = useState<Date>();

        const value = info.getValue();
        useEffect(() => {
          if (value) setDueDate(value);
        }, [value]);

        const queryClient = useQueryClient();

        const { mutate: updateTodo } = useMutation(
          trpc.app.todo.update.mutationOptions({
            async onMutate(newData) {
              // Cancel outgoing fetches (so they don't overwrite our optimistic update)
              await queryClient.cancelQueries(
                trpc.app.todo.getAll.pathFilter(),
              );

              // Get the previous data, so we can rollback later
              const prevData = dueDate;
              // Optimistically update to the new value
              setDueDate(newData.dueDate ?? undefined);
              return { prevData };
            },
            onError(err, _newTodo, ctx) {
              trpcErrorToastDefault(err);
              // If the mutation fails, use the context-value from onMutate
              setDueDate(ctx?.prevData ?? undefined);
            },
          }),
        );

        function handleDueDateChange(newDueDate: Date | undefined | null) {
          updateTodo({ id: info.row.original.id, dueDate: newDueDate });
        }

        return (
          <div className="text-right">
            <DatePickerWithPresets
              date={dueDate}
              setDate={handleDueDateChange}
            />
          </div>
        );
      },
    }),
    columnHelper.accessor("AssignedToUser", {
      cell: function Cell(info) {
        const [assignedToUserId, setAssignedToUserId] = useState("");

        const value = info.getValue();
        useEffect(() => {
          if (value) setAssignedToUserId(value.id);
        }, [value]);

        const queryClient = useQueryClient();

        const { mutate: updateTodo } = useMutation(
          trpc.app.todo.update.mutationOptions({
            async onMutate(newData) {
              // Cancel outgoing fetches (so they don't overwrite our optimistic update)
              await queryClient.cancelQueries(
                trpc.app.todo.getAll.pathFilter(),
              );

              // Get the previous data, so we can rollback later
              const prevData = assignedToUserId;
              // Optimistically update to the new value
              setAssignedToUserId(newData.assignedToUserId ?? "");
              return { prevData };
            },
            onError(err, _newTodo, ctx) {
              if (!ctx?.prevData) return;

              trpcErrorToastDefault(err);
              // If the mutation fails, use the context-value from onMutate
              setAssignedToUserId(ctx.prevData);
            },
          }),
        );

        function handleAssignedToUserChange(
          newAssignedToUserId: string | null,
        ) {
          updateTodo({
            id: info.row.original.id,
            assignedToUserId: newAssignedToUserId,
          });
        }

        return (
          <div className="text-right">
            <AssigneePopover
              assignedToUserId={assignedToUserId}
              setAssignedToUserId={handleAssignedToUserChange}
              users={info.table.options.meta?.team?.Users ?? []}
            />
          </div>
        );
      },
    }),
  ];
  const table = useReactTable({
    data: todosQuery.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by title..."
          value={table.getColumn("title")?.getFilterValue() as string}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    <ContextMenuTrigger className="contents">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, {
                            ...cell.getContext(),
                            team: "a",
                          })}
                        </TableCell>
                      ))}
                    </ContextMenuTrigger>
                  </TableRow>
                  <ContextMenuContent>
                    {row.getValue("status") === 2}
                    <ContextMenuItem>Status</ContextMenuItem>
                    <ContextMenuItem>Assignee</ContextMenuItem>
                    <ContextMenuItem>Priority</ContextMenuItem>
                    <ContextMenuItem>Change due date...</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  You have no tasks. Yet. Create one
                  <CreateTaskDialogButton />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

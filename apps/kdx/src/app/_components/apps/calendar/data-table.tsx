"use client";

import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PencilIcon,
  Trash2,
} from "lucide-react";
import moment from "moment";

import type { RouterOutputs } from "@kdx/api";
import { authorizedEmails } from "@kdx/api/src/shared";
import type { Session } from "@kdx/auth";
import {
  Button,
  Calendar,
  cn,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui";

import { api } from "~/trpc/react";
import { DataTablePagination } from "../../pagination";
import { CancelationDialog } from "./cancel-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

type CalendarTask = RouterOutputs["event"]["getAll"][number];

export function DataTable({
  columns,
  data,
  session,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<CalendarTask, any>[];
  data: CalendarTask[];
  session: Session;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [selectedDay, setSelectedDay] = useState<Date>(moment().utc().toDate());
  const [calendarTask, setCalendarTask] = useState<CalendarTask | undefined>();

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const ctx = api.useUtils();
  const result = api.event.getAll.useQuery(
    {
      dateStart: moment(selectedDay).startOf("day").toDate(),
      dateEnd: moment(selectedDay).endOf("day").toDate(),
    },
    {
      refetchOnWindowFocus: false,
      initialData: data,
      staleTime: 0,
    },
  );

  const { mutate: nukeEvents } = api.event.nuke.useMutation({
    onSuccess() {
      void ctx.event.getAll.invalidate();
    },
  });

  const table = useReactTable({
    data: result.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setSelectedDay((prev) => prev && addDays(prev, -1));
      else if (e.key === "ArrowRight")
        setSelectedDay((prev) => prev && addDays(prev, 1));
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);

  return (
    <div className="mt-8">
      <div className="flex justify-between">
        <div className=" w-44 space-y-2">
          <Label htmlFor="search">Search...</Label>
          <Input
            id="search"
            placeholder="Search by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="mx-auto mt-auto flex space-x-2">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedDay((prev) => prev && addDays(prev, -1));
            }}
            className="h-10 w-10 p-3"
          >
            <ChevronLeft />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDay && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDay ? (
                  format(selectedDay, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={(date) => {
                  if (date) setSelectedDay(date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedDay((prev) => prev && addDays(prev, 1));
            }}
            className="h-10 w-10 p-3"
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="flex w-44">
          {session.user.email &&
            authorizedEmails.includes(session.user.email) && (
              <Button
                className="ml-auto mr-2 self-end"
                onClick={() => nukeEvents()}
                variant={"destructive"}
              >
                Nuke Events
              </Button>
            )}

          <Button
            className="ml-auto self-end "
            onClick={() => setSelectedDay(new Date())}
            variant={"secondary"}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-md border">
        {calendarTask && (
          <>
            <EditEventDialog
              calendarTask={calendarTask}
              open={openEditDialog}
              setOpen={setOpenEditDialog}
            />
            <CancelationDialog
              open={openCancelDialog}
              setOpen={setOpenCancelDialog}
              eventMasterId={calendarTask.eventMasterId}
              eventExceptionId={calendarTask.eventExceptionId}
              date={calendarTask.date}
            />
          </>
        )}
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
            {result.isLoading || result.isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setCalendarTask(row.original);
                        setOpenEditDialog(true);
                      }}
                    >
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit Event
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setCalendarTask(row.original);
                        setOpenCancelDialog(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </ContextMenuItem>
                  </ContextMenuContent>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, {
                            ...cell.getContext(),
                          })}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No events for this day
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

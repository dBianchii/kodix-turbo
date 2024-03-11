"use client";

import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import { LuLoader2 } from "react-icons/lu";
import {
  RxCalendar,
  RxChevronLeft,
  RxChevronRight,
  RxPencil1,
  RxTrash,
} from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { authorizedEmails } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import { Calendar } from "@kdx/ui/calendar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@kdx/ui/context-menu";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { cn } from "@kdx/ui/utils";

import { DataTablePagination } from "~/app/_components/pagination";
import { api } from "~/trpc/react";
import { CancelationDialog } from "./cancel-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

type CalendarTask = RouterOutputs["app"]["calendar"]["getAll"][number];

export function DataTable({
  columns,
  session,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<CalendarTask, any>[];
  session: Session;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [selectedDay, setSelectedDay] = useState<Date>(dayjs.utc().toDate());
  const [calendarTask, setCalendarTask] = useState<CalendarTask | undefined>();

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const utils = api.useUtils();
  const [data, query] = api.app.calendar.getAll.useSuspenseQuery({
    dateStart: dayjs(selectedDay).startOf("day").toDate(),
    dateEnd: dayjs(selectedDay).endOf("day").toDate(),
  });

  const { mutate: nukeEvents } = api.app.calendar.nuke.useMutation({
    onSuccess() {
      void utils.app.calendar.getAll.invalidate();
    },
  });

  const table = useReactTable({
    data: data,
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
            <RxChevronLeft />
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
                <RxCalendar className="mr-2 size-4" />
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
            <RxChevronRight />
          </Button>
        </div>
        <div className="flex w-44">
          {authorizedEmails.includes(session.user.email) && (
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
            {query.isLoading || query.isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex h-full items-center justify-center">
                    <LuLoader2 className="h-6 w-6 animate-spin" />
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
                      <RxPencil1 className="mr-2 size-4" />
                      Edit Event
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setCalendarTask(row.original);
                        setOpenCancelDialog(true);
                      }}
                    >
                      <RxTrash className="mr-2 size-4" />
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

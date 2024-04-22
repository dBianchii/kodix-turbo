"use client";

import type { ColumnFiltersState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LuLoader2 } from "react-icons/lu";
import {
  RxChevronLeft,
  RxChevronRight,
  RxDotsHorizontal,
  RxPencil1,
  RxTrash,
} from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { Session } from "@kdx/auth";
import { addDays } from "@kdx/date-fns";
import dayjs from "@kdx/dayjs";
import { useI18n } from "@kdx/locales/client";
import { authorizedEmails } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@kdx/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";

import { DatePicker } from "~/app/[locale]/_components/date-picker";
import { DataTablePagination } from "~/app/[locale]/_components/pagination";
import { api } from "~/trpc/react";
import { CancelationDialog } from "./cancel-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

type CalendarTask = RouterOutputs["app"]["calendar"]["getAll"][number];
const columnHelper = createColumnHelper<CalendarTask>();

export function DataTable({
  data,
  session,
}: {
  data: CalendarTask[];
  session: Session;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [selectedDay, setSelectedDay] = useState(new Date());
  const [calendarTask, setCalendarTask] = useState<CalendarTask | undefined>();

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const utils = api.useUtils();
  const getAllQuery = api.app.calendar.getAll.useQuery(
    {
      dateStart: dayjs(selectedDay).startOf("day").toDate(),
      dateEnd: dayjs(selectedDay).endOf("day").toDate(),
    },
    {
      refetchOnWindowFocus: false,
      initialData: data,
      staleTime: 0,
    },
  );

  const { mutate: nukeEvents } = api.app.calendar.nuke.useMutation({
    onSuccess() {
      void utils.app.calendar.getAll.invalidate();
    },
  });

  const t = useI18n();

  const columns = [
    columnHelper.accessor("eventMasterId", {
      header: () => (
        <>
          {/* <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          /> */}
        </>
      ),
      cell: function Cell(info) {
        const [openCancelDialog, setOpenCancelDialog] = useState(false);
        const [openEditDialog, setOpenEditDialog] = useState(false);
        return (
          <div className="space-x-4">
            {/* <Checkbox
              checked={info.row.getIsSelected()}
              onCheckedChange={(value) => info.row.toggleSelected(!!value)}
              aria-label="Select row"
            /> */}
            <EditEventDialog
              calendarTask={info.row.original}
              open={openEditDialog}
              setOpen={setOpenEditDialog}
            />
            <CancelationDialog
              open={openCancelDialog}
              setOpen={setOpenCancelDialog}
              eventMasterId={info.row.original.eventMasterId}
              eventExceptionId={info.row.original.eventExceptionId}
              date={info.row.original.date}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <RxDotsHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
                  <RxPencil1 className="mr-2 size-4" />
                  {t("apps.calendar.Edit event")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenCancelDialog(true)}>
                  <RxTrash className="mr-2 size-4" />
                  {t("apps.calendar.Delete event")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("title", {
      header: () => <div>{t("Title")}</div>,
      cell: (info) => <div className="font-bold">{info.getValue()}</div>,
    }),
    columnHelper.accessor("description", {
      header: () => <div>{t("Description")}</div>,
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
    }),
    columnHelper.accessor("date", {
      header: () => <div>{t("Date")}</div>,
      cell: (info) => (
        <div className="text-sm">{info.getValue().toLocaleString()}</div>
      ),
    }),
  ];

  const table = useReactTable({
    data: getAllQuery.data,
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
      if (e.key === "ArrowLeft") setSelectedDay((prev) => addDays(prev, -1));
      else if (e.key === "ArrowRight")
        setSelectedDay((prev) => addDays(prev, 1));
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);

  return (
    <>
      <div className="pt-8">
        <div className="flex justify-between">
          <div className=" w-44 space-y-2">
            <Label htmlFor="search">{t("Search")}...</Label>
            <Input
              id="search"
              placeholder={`${t("Search by title")}...`}
              value={table.getColumn("title")?.getFilterValue() as string}
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
                setSelectedDay((prev) => addDays(prev, -1));
              }}
              className="h-10 w-10 p-3"
            >
              <RxChevronLeft />
            </Button>
            <DatePicker
              className=""
              date={selectedDay}
              setDate={(date) => {
                if (date) setSelectedDay(date);
              }}
            />
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedDay((prev) => addDays(prev, 1));
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
              {t("Today")}
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
              {getAllQuery.isFetching ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24">
                    <div className="flex h-full items-center justify-center">
                      <LuLoader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
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
                        {t("Edit event")}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => {
                          setCalendarTask(row.original);
                          setOpenCancelDialog(true);
                        }}
                      >
                        <RxTrash className="mr-2 size-4" />
                        {t("Delete event")}
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
                    {t("apps.kodixCare.No events for this day")}
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
    </>
  );
}

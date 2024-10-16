"use client";

import type { ColumnFiltersState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { addDays } from "date-fns";
import { LuAlertCircle, LuLoader2, LuText } from "react-icons/lu";
import {
  RxCalendar,
  RxChevronLeft,
  RxChevronRight,
  RxDotsHorizontal,
  RxPencil1,
  RxTrash,
} from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { useFormatter } from "@kdx/locales/next-intl";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { authorizedEmails } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@kdx/ui/context-menu";
import { DataTablePagination } from "@kdx/ui/data-table/data-table-pagination";
import { HeaderSort } from "@kdx/ui/data-table/header-sort";
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

import { DatePicker } from "~/app/[locale]/_components/date-picker";
import { api } from "~/trpc/react";
import { CancelationDialog } from "./cancel-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

type CalendarTask = RouterOutputs["app"]["calendar"]["getAll"][number];
const columnHelper = createColumnHelper<CalendarTask>();

export function DataTable({
  data,
  user,
}: {
  data: CalendarTask[];
  user: User;
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
      void utils.app.kodixCare.getCareTasks.invalidate();
    },
  });

  const t = useTranslations();
  const format = useFormatter();

  const columns = useMemo(
    () => [
      columnHelper.accessor("eventMasterId", {
        header: () => <></>,
        cell: function Cell(info) {
          return (
            <div className="space-x-4">
              {/* <Checkbox
              checked={info.row.getIsSelected()}
              onCheckedChange={(value) => info.row.toggleSelected(!!value)}
              aria-label="Select row"
            /> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <RxDotsHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      setCalendarTask(info.row.original);
                      setOpenEditDialog(true);
                    }}
                  >
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
        header: ({ column }) => (
          <HeaderSort column={column}>{t("Title")}</HeaderSort>
        ),
        cell: (info) => <div className="font-bold">{info.getValue()}</div>,
      }),
      columnHelper.accessor("description", {
        header: ({ column }) => {
          return (
            <HeaderSort column={column}>
              <LuText className="mr-2 size-4" />
              {t("Description")}
            </HeaderSort>
          );
        },
        cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      }),
      columnHelper.accessor("date", {
        header: ({ column }) => (
          <HeaderSort column={column}>
            <RxCalendar className="mr-2 size-4" />
            {t("Date")}
          </HeaderSort>
        ),
        cell: (info) => (
          <div className="text-sm">
            {format.dateTime(info.getValue(), "extensive")}
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <HeaderSort column={column}>
            <LuAlertCircle className="mr-2 size-4 text-orange-400" />
            {t("Critical")}
          </HeaderSort>
        ),
        cell: (ctx) => (
          <div>
            {ctx.getValue() === "CRITICAL" ? (
              <LuAlertCircle className="ml-4 size-4 text-orange-400" />
            ) : null}
          </div>
        ),
      }),
    ],
    [format, t],
  );

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
      <div className="pt-8">
        <div className="flex justify-between">
          <Button
            className="invisible"
            onClick={() => setSelectedDay(new Date())}
            variant={"secondary"}
          >
            {t("Today")}
          </Button>
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
          <div>
            {authorizedEmails.includes(user.email) && (
              <Button
                className="ml-auto mr-2 self-end"
                onClick={() => nukeEvents()}
                variant={"destructive"}
              >
                Nuke Events
              </Button>
            )}
            <Button
              className="ml-auto self-end"
              onClick={() => setSelectedDay(new Date())}
              variant={"secondary"}
            >
              {t("Today")}
            </Button>
          </div>
        </div>
        <div className="mt-4 rounded-md border">
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

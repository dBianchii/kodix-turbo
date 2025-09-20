"use client";

import type { ColumnFiltersState } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "@kodix/dayjs";
import { Button } from "@kodix/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@kodix/ui/context-menu";
import { DataTableColumnHeader } from "@kodix/ui/data-table/data-table-column-header";
import { DataTablePagination } from "@kodix/ui/data-table/data-table-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { useIsAnyOverlayMounted } from "@kodix/ui/stores/use-overlay-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";
import {
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuCircleAlert,
  LuLoaderCircle,
  LuPencil,
  LuText,
  LuTrash,
} from "react-icons/lu";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";

import { DatePicker } from "~/app/[locale]/_components/date-picker";
import { useTRPC } from "~/trpc/react";

import { CancelationDialog } from "./cancel-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

const useLeftAndRightKeyboardArrowClicks = () => {
  const shouldDisable = useIsAnyOverlayMounted();

  const leftArrowRef = useRef<HTMLButtonElement>(null);
  const rightArrowRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (shouldDisable) return;

      if (e.key === "ArrowLeft") leftArrowRef.current?.click();
      else if (e.key === "ArrowRight") rightArrowRef.current?.click();
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [shouldDisable]);

  return { leftArrowRef, rightArrowRef };
};

type CalendarTask = RouterOutputs["app"]["calendar"]["getAll"][number];
const columnHelper = createColumnHelper<CalendarTask>();

const useCalendarData = () => {
  const trpc = useTRPC();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const inputForQuery = useMemo(
    () => ({
      dateStart: dayjs(selectedDay).startOf("day").toDate(),
      dateEnd: dayjs(selectedDay).endOf("day").toDate(),
    }),
    [selectedDay],
  );
  const getAllQuery = useQuery(
    trpc.app.calendar.getAll.queryOptions(inputForQuery, {
      staleTime: 10,
    }),
  );

  return {
    selectedDay,
    setSelectedDay,
    getAllQuery,
  };
};

const useTable = ({
  data,
  setCalendarTask,
  setOpenEditDialog,
  setOpenCancelDialog,
}: {
  data: CalendarTask[];
  setCalendarTask: (task: CalendarTask) => void;
  setOpenEditDialog: (value: boolean) => void;
  setOpenCancelDialog: (value: boolean) => void;
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const format = useFormatter();
  const t = useTranslations();

  const columns = useMemo(
    () => [
      columnHelper.accessor("eventMasterId", {
        header: () => <></>,
        cell(info) {
          return (
            <div className="space-x-4">
              {/* <Checkbox
              checked={info.row.getIsSelected()}
              onCheckedChange={(value) => info.row.toggleSelected(!!value)}
              aria-label="Select row"
            /> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-8 w-8 p-0" variant="ghost">
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
                    <LuPencil className="mr-2 size-4" />
                    {t("apps.calendar.Edit event")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenCancelDialog(true)}>
                    <LuTrash className="mr-2 size-4 text-destructive" />
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
          <DataTableColumnHeader column={column}>
            {t("Title")}
          </DataTableColumnHeader>
        ),
        cell: (info) => <div className="font-bold">{info.getValue()}</div>,
      }),
      columnHelper.accessor("description", {
        header: ({ column }) => {
          return (
            <DataTableColumnHeader column={column}>
              <LuText className="mr-2 size-4" />
              {t("Description")}
            </DataTableColumnHeader>
          );
        },
        cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      }),
      columnHelper.accessor("date", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <LuCalendar className="mr-2 size-4" />
            {t("Date")}
          </DataTableColumnHeader>
        ),
        cell: (info) => (
          <div className="text-sm">
            {format.dateTime(info.getValue(), "extensive")}
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column}>
            <LuCircleAlert className="mr-2 size-4 text-orange-400" />
            {t("Critical")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => (
          <div>
            {ctx.getValue() === "CRITICAL" ? (
              <LuCircleAlert className="ml-4 size-4 text-orange-400" />
            ) : null}
          </div>
        ),
      }),
    ],
    [format, setCalendarTask, setOpenCancelDialog, setOpenEditDialog, t],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return { table, columnLength: columns.length };
};

export function DataTable() {
  const [calendarTask, setCalendarTask] = useState<CalendarTask | undefined>();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const { getAllQuery, selectedDay, setSelectedDay } = useCalendarData();

  const data = useMemo(() => getAllQuery.data ?? [], [getAllQuery.data]);

  const t = useTranslations();

  const { leftArrowRef, rightArrowRef } = useLeftAndRightKeyboardArrowClicks();

  const { table, columnLength } = useTable({
    data,
    setCalendarTask,
    setOpenEditDialog,
    setOpenCancelDialog,
  });

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
            date={calendarTask.date}
            eventExceptionId={calendarTask.eventExceptionId}
            eventMasterId={calendarTask.eventMasterId}
            open={openCancelDialog}
            setOpen={setOpenCancelDialog}
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
              className="h-10 w-10 p-3"
              onClick={() =>
                setSelectedDay((prev) =>
                  dayjs(prev).subtract(1, "day").toDate(),
                )
              }
              ref={leftArrowRef}
              variant="ghost"
            >
              <LuChevronLeft />
            </Button>
            <DatePicker
              date={selectedDay}
              setDate={(date) => {
                if (date) setSelectedDay(date);
              }}
            />
            <Button
              className="h-10 w-10 p-3"
              onClick={() =>
                setSelectedDay((prev) => dayjs(prev).add(1, "day").toDate())
              }
              ref={rightArrowRef}
              variant="ghost"
            >
              <LuChevronRight />
            </Button>
          </div>
          <div>
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
                  <TableCell className="h-24" colSpan={columnLength}>
                    <div className="flex h-full items-center justify-center">
                      <LuLoaderCircle className="h-6 w-6 animate-spin" />
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
                        <LuPencil className="mr-2 size-4" />
                        {t("Edit event")}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => {
                          setCalendarTask(row.original);
                          setOpenCancelDialog(true);
                        }}
                      >
                        <LuTrash className="mr-2 size-4 text-destructive" />
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
                    className="h-24 text-center"
                    colSpan={columnLength}
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

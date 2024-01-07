"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { RxDotsHorizontal, RxPencil1, RxTrash } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";

import { CancelationDialog } from "./cancel-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

type CalendarTask = RouterOutputs["event"]["getAll"][number];
const columnHelper = createColumnHelper<CalendarTask>();

//TODO: extract dialogs to one meta component
export const columns = [
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
                <RxDotsHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
                <RxPencil1 className="mr-2 h-4 w-4" />
                Edit event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenCancelDialog(true)}>
                <RxTrash className="mr-2 h-4 w-4" />
                Delete Event
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
    header: () => <div>Title</div>,
    cell: (info) => <div className="font-bold">{info.getValue()}</div>,
  }),
  columnHelper.accessor("description", {
    header: () => <div>Description</div>,
    cell: (info) => <div className="text-sm">{info.getValue()}</div>,
  }),
  columnHelper.accessor("date", {
    header: () => <div>Date</div>,
    cell: (info) => (
      <div className="text-sm">{info.getValue().toLocaleString()}</div>
    ),
  }),
];

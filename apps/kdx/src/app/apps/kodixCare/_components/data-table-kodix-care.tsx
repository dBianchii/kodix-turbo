"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { RxPencil1 } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import type { FixedColumnsType } from "@kdx/ui/data-table";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";
import { DataTable } from "@kdx/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kdx/ui/dialog";
import { Textarea } from "@kdx/ui/textarea";
import { TimePickerInput } from "@kdx/ui/time-picker-input";

import { DatePicker } from "~/app/_components/date-picker";
import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<
    RouterOutputs["app"]["kodixCare"]["getCareTasks"][number]
  >();

export default function DataTableKodixCare({
  initialCareTasks,
  input,
}: {
  initialCareTasks: RouterOutputs["app"]["kodixCare"]["getCareTasks"];
  input: TGetCareTasksInputSchema;
}) {
  // ***** Coloquei o UseState aqui
  const [selectedDate, setDate] = useState(null);

  const { data } = api.app.kodixCare.getCareTasks.useQuery(input, {
    refetchOnMount: false,
    initialData: initialCareTasks,
  });

  const columns = [
    columnHelper.accessor("title", {
      header: () => <div className="pl-2">Title</div>,
      cell: (info) => <span className="pl-2 ">{info.getValue()}</span>,
    }),
    columnHelper.accessor("description", {
      header: () => <div>Description</div>,
      cell: (info) => <p className="">{info.getValue()}</p>,
    }),
    columnHelper.accessor("date", {
      header: () => <div>Date and time</div>,
      cell: (info) => (
        <div className="flex w-60 flex-row gap-3 pl-2">
          <div className="flex flex-col items-start">
            <span className="">
              {dayjs(info.getValue()).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => {
        return (
          <div className="flex flex-row items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"ghost"}>
                  <RxPencil1 className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add notes</DialogTitle>
                  <DialogDescription>
                    Add custom notes to this task
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder="Any information..."
                    className="w-full"
                    rows={6}
                  />
                </div>
                <DialogFooter className="mt-6 gap-3 sm:justify-between">
                  <DialogClose asChild>
                    <Button variant={"ghost"}>Close</Button>
                  </DialogClose>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {info.row.original.isCareTask && (
              <div className="p-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Checkbox
                      checked={false}
                      className="ml-4 size-6 border-muted-foreground"
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Add information to conclude this task
                      </DialogTitle>
                      <DialogDescription>
                        Add the date and time of completion and details about
                        the procedure.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(newDate) => setDate(newDate)}
                      />
                      <div className="flex flex-row gap-2">
                        <TimePickerInput
                          picker={"hours"}
                          date={new Date()}
                          setDate={() => {}}
                        />
                        <TimePickerInput
                          picker={"minutes"}
                          date={new Date()}
                          setDate={() => {}}
                        />
                      </div>
                      <Textarea
                        placeholder="Any information..."
                        className="w-full"
                        rows={6}
                      />
                    </div>
                    <DialogFooter className="mt-6 gap-3 sm:justify-between">
                      <DialogClose asChild>
                        <Button variant={"ghost"}>Close</Button>
                      </DialogClose>
                      <Button>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        );
      },
    }),
  ] as FixedColumnsType<
    RouterOutputs["app"]["kodixCare"]["getCareTasks"][number]
  >;

  return <DataTable columns={columns} data={data} />;
}

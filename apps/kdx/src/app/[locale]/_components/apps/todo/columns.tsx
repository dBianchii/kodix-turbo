"use client";

import type { RowData } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type { schema } from "@kdx/db/schema";
import { Button } from "@kdx/ui/button";
import { Checkbox } from "@kdx/ui/checkbox";

import type { Priority } from "./priority-popover";
import { DatePickerWithPresets } from "~/app/[locale]/_components/date-picker-with-presets";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";
import { AssigneePopover } from "./assignee-popover";
import {
  PriorityIcon,
  PriorityPopover,
  PriorityToTxt,
} from "./priority-popover";
import { StatusIcon, StatusPopover, StatusToText } from "./status-popover";

export type TodoColumn = RouterOutputs["app"]["todo"]["getAll"][number];
const columnHelper = createColumnHelper<TodoColumn>();
type team = RouterOutputs["team"]["getActiveTeam"];

type Status = typeof schema.todos.$inferInsert.status;
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    team: team | undefined;
  }
}

//TODO: Yikes! This stinks. Let's create a new mutation inside a meta, so we dont have so many apiCalls in this file.
//TODO: https://muhimasri.com/blogs/react-editable-table/
export const columns = [
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

      const utils = api.useUtils();
      const { mutate: updateTodo } = api.app.todo.update.useMutation({
        async onMutate(newData) {
          if (!newData.priority) return;

          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await utils.app.todo.getAll.cancel();

          // Get the previous data, so we can rollback later
          const prevData = priority;
          // Optimistically update to the new value
          setPriority(newData.priority as Priority);
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          if (!ctx?.prevData) return;

          trpcErrorToastDefault(err);
          // If the mutation fails, use the context-value from onMutate
          setPriority(ctx.prevData);
        },
      });

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

      const utils = api.useUtils();
      const { mutate: updateTodo } = api.app.todo.update.useMutation({
        async onMutate(newData) {
          if (!newData.status) return;

          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await utils.app.todo.getAll.cancel();

          // Get the previous data, so we can rollback later
          const prevData = status;
          // Optimistically update to the new value
          setStatus(newData.status);
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          if (!ctx?.prevData) return;

          trpcErrorToastDefault(err);
          // If the mutation fails, use the context-value from onMutate
          setStatus(ctx.prevData);
        },
      });

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

      const utils = api.useUtils();
      const { mutate: updateTodo } = api.app.todo.update.useMutation({
        async onMutate(newData) {
          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await utils.app.todo.getAll.cancel();

          // Get the previous data, so we can rollback later
          const prevData = dueDate;
          // Optimistically update to the new value
          setDueDate(newData.dueDate ?? undefined);
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          trpcErrorToastDefault(err);
          // If the mutation fails, use the context-value from onMutate
          setDueDate(ctx?.prevData ?? undefined);
        },
      });

      function handleDueDateChange(newDueDate: Date | undefined | null) {
        updateTodo({ id: info.row.original.id, dueDate: newDueDate });
      }

      return (
        <div className="text-right">
          <DatePickerWithPresets date={dueDate} setDate={handleDueDateChange} />
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

      const utils = api.useUtils();
      const { mutate: updateTodo } = api.app.todo.update.useMutation({
        async onMutate(newData) {
          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await utils.app.todo.getAll.cancel();

          // Get the previous data, so we can rollback later
          const prevData = assignedToUserId;
          // Optimistically update to the new value
          setAssignedToUserId(newData.assignedToUserId ?? "");
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          if (!ctx?.prevData) return;

          trpcErrorToastDefault(err);
          // If the mutation fails, use the context-value from onMutate
          setAssignedToUserId(ctx.prevData);
        },
      });

      function handleAssignedToUserChange(newAssignedToUserId: string | null) {
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

    // cell: (info) => {
    //   const user = info.getValue();
    //   if (!user?.image) return;
    //   return (
    //     <div>
    //       <Avatar className="h-6 w-6">
    //         <AvatarImage
    //           src={user.image}
    //           alt={user.name ? user.name + " avatar" : ""}
    //         />
    //         <AvatarFallback>
    //           {user.name &&
    //             user.name
    //               .split(" ")
    //               .map((n) => n[0])
    //               .join("")}
    //         </AvatarFallback>
    //       </Avatar>
    //     </div>
    //   );
    // },
  }),
  // {
  //   accessorKey: "status",
  //   header: () => <div className="text-left">Status</div>,
  //   cell: ({ row }) => {
  //     const currentStatus = String(row.getValue("status")) as Status;
  //     const Icon = StatusIcon(currentStatus, "mr-2");
  //     const statusTxt = StatusToText(currentStatus);
  //     return (
  //       <Button variant="outline" size="sm">
  //         {Icon} {"  " + statusTxt}
  //         <span className="sr-only">Open status popover</span>
  //       </Button>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "title",
  //   header: "Title",
  // },

  // {
  //   accessorKey: "dueDate",
  //   header: "",
  //   cell: ({ row }) => {
  //     const dateString = row.getValue("dueDate")?.toString();
  //     if (!dateString) return;
  //     const formatedDate = format(new Date(dateString ?? ""), "PPP").split(
  //       ","
  //     )[0]; //This format should be like 'May 11th'
  //     return (
  //       <div className="text-right">
  //         <Button variant="ghost" size="sm">
  //           {<Calendar className="mr-2 size-4" />}
  //           <span className="">{formatedDate}</span>
  //         </Button>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "assignedToUserId",
  //   header: "",
  //   cell: ({ row }) => {
  //     const userImage = row.getValue("assignedToUserImage")?.toString();
  //     if (!userImage) return;
  //     return (
  //       <div className="text-right">
  //         <Avatar>
  //           <AvatarImage src={userImage} alt="@shadcn" />
  //           <AvatarFallback>CN</AvatarFallback>
  //         </Avatar>
  //       </div>
  //     );
  //   },
  // },
];

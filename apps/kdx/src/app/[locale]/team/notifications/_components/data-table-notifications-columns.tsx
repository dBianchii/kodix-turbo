import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import { format } from "@kdx/date-fns";
import { useCurrentLocale } from "@kdx/locales/client";
import { Checkbox } from "@kdx/ui/checkbox";
import { DataTableColumnHeader } from "@kdx/ui/data-table/data-table-column-header";

const columnHelper =
  createColumnHelper<
    RouterOutputs["user"]["getNotifications"]["data"][number]
  >();

export function getColumns() {
  return [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("message", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Message" />
      ),
      cell: ({ row }) => <div className="w-20">{row.original.message}</div>,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("channel", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Channel" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="capitalize">{row.original.channel}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    }),
    columnHelper.accessor("sentAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent at" />
      ),
      cell: function Cell({ cell }) {
        const locale = useCurrentLocale();
        return format(cell.row.original.sentAt, "PPP, HH:mm", locale);
      },
    }),
    // {
    //   id: "actions",
    //   cell: function Cell({ row }) {
    //     const [isUpdatePending, startUpdateTransition] = React.useTransition();
    //     const [showUpdateTaskSheet, setShowUpdateTaskSheet] =
    //       React.useState(false);
    //     const [showDeleteTaskDialog, setShowDeleteTaskDialog] =
    //       React.useState(false);

    //     return (
    //       <>
    //         <UpdateTaskSheet
    //           open={showUpdateTaskSheet}
    //           onOpenChange={setShowUpdateTaskSheet}
    //           task={row.original}
    //         />
    //         <DeleteTasksDialog
    //           open={showDeleteTaskDialog}
    //           onOpenChange={setShowDeleteTaskDialog}
    //           tasks={[row]}
    //           showTrigger={false}
    //         />
    //         <DropdownMenu>
    //           <DropdownMenuTrigger asChild>
    //             <Button
    //               aria-label="Open menu"
    //               variant="ghost"
    //               className="flex size-8 p-0 data-[state=open]:bg-muted"
    //             >
    //               <DotsHorizontalIcon className="size-4" aria-hidden="true" />
    //             </Button>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent align="end" className="w-40">
    //             <DropdownMenuItem onSelect={() => setShowUpdateTaskSheet(true)}>
    //               Edit
    //             </DropdownMenuItem>
    //             <DropdownMenuSub>
    //               <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
    //               <DropdownMenuSubContent>
    //                 <DropdownMenuRadioGroup
    //                   value={row.original.label}
    //                   onValueChange={(value) => {
    //                     startUpdateTransition(() => {
    //                       toast.promise(
    //                         updateTask({
    //                           id: row.original.id,
    //                           label: value as Task["label"],
    //                         }),
    //                         {
    //                           loading: "Updating...",
    //                           success: "Label updated",
    //                           error: (err) => getErrorMessage(err),
    //                         },
    //                       );
    //                     });
    //                   }}
    //                 >
    //                   {tasks.label.enumValues.map((label) => (
    //                     <DropdownMenuRadioItem
    //                       key={label}
    //                       value={label}
    //                       className="capitalize"
    //                       disabled={isUpdatePending}
    //                     >
    //                       {label}
    //                     </DropdownMenuRadioItem>
    //                   ))}
    //                 </DropdownMenuRadioGroup>
    //               </DropdownMenuSubContent>
    //             </DropdownMenuSub>
    //             <DropdownMenuSeparator />
    //             <DropdownMenuItem
    //               onSelect={() => setShowDeleteTaskDialog(true)}
    //             >
    //               Delete
    //               <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    //             </DropdownMenuItem>
    //           </DropdownMenuContent>
    //         </DropdownMenu>
    //       </>
    //     );
    //   },
    // },
  ];
}

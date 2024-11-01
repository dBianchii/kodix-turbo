"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { cn } from "@kdx/ui";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
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
import { toast } from "@kdx/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<RouterOutputs["team"]["invitation"]["getAll"][number]>();

export function InviteDataTable({
  initialInvitations,
  canEditPage,
}: {
  initialInvitations: RouterOutputs["team"]["invitation"]["getAll"];
  canEditPage: boolean;
}) {
  const { data } = api.team.invitation.getAll.useQuery(undefined, {
    initialData: initialInvitations,
    staleTime: 30000,
  });
  const t = useTranslations();
  const utils = api.useUtils();
  const { mutate } = api.team.invitation.delete.useMutation({
    onSuccess: () => {
      toast.success(t("Invite deleted"));
    },
    onError: (e) => {
      trpcErrorToastDefault(e);
    },
    onSettled: () => {
      void utils.team.invitation.getAll.invalidate();
    },
  });

  const columns = [
    columnHelper.accessor("inviteEmail", {
      header: () => <div className="ml-2">User</div>,
      cell: (info) => (
        <div className="ml-2 flex flex-row gap-4">
          <div className="flex flex-col">
            <AvatarWrapper className="h-8 w-8" fallback={info.getValue()} />
          </div>
          <div className="flex flex-col items-center justify-center">
            {info.cell.row.original.inviteEmail}
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: true,
    }),
    columnHelper.accessor("inviteId", {
      header: () => null,
      cell: (info) => {
        return (
          <div className="flex justify-end">
            <TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("Open menu")}</span>
                    <RxDotsHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <DropdownMenuItem
                          disabled={!canEditPage}
                          className="text-destructive"
                          onSelect={() => {
                            mutate({
                              invitationId: info.row.original.inviteId,
                            });
                          }}
                        >
                          {t("Delete")}
                        </DropdownMenuItem>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className={cn("bg-background", {
                        hidden: canEditPage, // Only show tooltip if the user can't edit page
                      })}
                    >
                      <p>
                        {t("Only the owner of the team can remove invites")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("No invitations right now")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

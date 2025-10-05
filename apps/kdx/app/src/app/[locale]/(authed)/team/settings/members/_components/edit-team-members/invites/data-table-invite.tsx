"use client";

import { useMemo } from "react";
import { cn } from "@kodix/ui";
import { AvatarWrapper } from "@kodix/ui/avatar-wrapper";
import { Button } from "@kodix/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { toast } from "@kodix/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kodix/ui/tooltip";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { RxDotsHorizontal } from "react-icons/rx";

import type { RouterOutputs } from "@kdx/api";
import { useTRPC } from "@kdx/api/trpc/react/client";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

const columnHelper =
  createColumnHelper<RouterOutputs["team"]["invitation"]["getAll"][number]>();

export function InviteDataTable({ canEditPage }: { canEditPage: boolean }) {
  const trpc = useTRPC();
  const getAllInvitationsQuery = useQuery(
    trpc.team.invitation.getAll.queryOptions(undefined, {
      refetchOnMount: true,
    }),
  );
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    trpc.team.invitation.delete.mutationOptions({
      onError: (e) => {
        trpcErrorToastDefault(e);
      },
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.team.invitation.getAll.pathFilter(),
        );
      },
      onSuccess: () => {
        toast.success(t("Invite deleted"));
      },
    }),
  );

  const columns = [
    columnHelper.accessor("inviteEmail", {
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
      enableHiding: false,
      enableResizing: true,
      enableSorting: false,
      header: () => <div className="ml-2">User</div>,
    }),
    columnHelper.accessor("inviteId", {
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
      header: () => null,
    }),
  ];

  const data = useMemo(
    () => getAllInvitationsQuery.data ?? [],
    [getAllInvitationsQuery.data],
  );

  const table = useReactTable({
    columns: columns,
    data: data,
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

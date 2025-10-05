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
import type { User } from "@kdx/auth";
import { useTRPC } from "@kdx/api/trpc/react/client";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

const columnHelper =
  createColumnHelper<RouterOutputs["team"]["getAllUsers"][number]>();

export function DataTableMembers({
  user,
  canEditPage,
}: {
  user: User;
  canEditPage: boolean;
}) {
  const trpc = useTRPC();
  const getAllUsersQuery = useQuery(trpc.team.getAllUsers.queryOptions());
  const data = useMemo(
    () => getAllUsersQuery.data ?? [],
    [getAllUsersQuery.data],
  );

  const queryClient = useQueryClient();
  const t = useTranslations();
  const { mutate } = useMutation(
    trpc.team.removeUser.mutationOptions({
      onError: (e) => trpcErrorToastDefault(e),
      onSuccess: () => {
        toast.success(t("User removed from team"));
        void queryClient.invalidateQueries(trpc.team.getAllUsers.pathFilter());
      },
    }),
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        cell: (info) => (
          <div className="ml-2 flex flex-row gap-4">
            <div className="flex flex-col">
              <AvatarWrapper
                className="h-8 w-8"
                src={info.cell.row.original.image ?? ""}
                fallback={info.getValue()}
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold">{info.cell.row.original.name}</span>
              <span className="text-muted-foreground text-xs">
                {info.cell.row.original.email}
              </span>
            </div>
          </div>
        ),
        enableHiding: false,
        enableResizing: true,
        enableSorting: false,
        header: () => <div className="ml-2">User</div>,
      }),
      columnHelper.display({
        cell: function Cell(info) {
          if (info.row.original.id === user.id) return null;

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
                                userId: info.row.original.id,
                              });
                            }}
                          >
                            {t("Remove")}
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
                          {t("Only the owner of the team can remove members")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>
            </div>
          );
        },
        id: "actions",
      }),
    ],
    [canEditPage, mutate, t, user.id],
  );

  const table = useReactTable({
    columns,
    data,
    defaultColumn: {
      size: 1,
    },
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
                {t("No members found")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

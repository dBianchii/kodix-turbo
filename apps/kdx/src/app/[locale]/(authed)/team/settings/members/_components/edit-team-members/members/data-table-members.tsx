"use client";

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
import { useTRPC } from "~/trpc/react";

const columnHelper =
  createColumnHelper<RouterOutputs["team"]["getAllUsers"][number]>();

export function DataTableMembers({
  user,
  canEditPage,
}: {
  user: User;
  canEditPage: boolean;
}) {
  const api = useTRPC();
  const { data } = useQuery(api.team.getAllUsers.queryOptions(undefined));

  const queryClient = useQueryClient();
  const t = useTranslations();
  const { mutate } = useMutation(
    api.team.removeUser.mutationOptions({
      onSuccess: () => {
        toast.success(t("User removed from team"));
        void queryClient.invalidateQueries(api.team.getAllUsers.pathFilter());
      },
      onError: (e) => trpcErrorToastDefault(e),
    }),
  );

  const columns = [
    columnHelper.accessor("name", {
      header: () => <div className="ml-2">User</div>,
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
            <span className="text-xs text-muted-foreground">
              {info.cell.row.original.email}
            </span>
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: true,
    }),
    columnHelper.display({
      id: "actions",
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
    }),
  ];

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 1,
    },
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

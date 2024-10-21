"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type {
  AppPermissionId,
  AppRoleDefaultId,
  KodixAppId,
} from "@kdx/shared";
import type { FixedColumnsType } from "@kdx/ui/data-table/data-table";
import { useTranslations } from "@kdx/locales/next-intl/client";
import {
  useAppPermissionName,
  useAppRoleDefaultNames,
} from "@kdx/locales/next-intl/hooks";
import { cn } from "@kdx/ui";
import { MultiSelect } from "@kdx/ui/multi-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<
    RouterOutputs["team"]["appRole"]["getPermissions"][number]
  >();

export function DataTableAppPermissions({
  initialPermissions,
  appId,
  allAppRoles,
}: {
  initialPermissions: RouterOutputs["team"]["appRole"]["getPermissions"];
  appId: KodixAppId;
  allAppRoles: RouterOutputs["team"]["appRole"]["getAll"];
}) {
  const utils = api.useUtils();

  const { data } = api.team.appRole.getPermissions.useQuery(
    { appId },
    {
      refetchOnMount: false,
      initialData: initialPermissions,
    },
  );
  const { mutate: updatePermissionAssociation } =
    api.team.appRole.updatePermissionAssociation.useMutation({
      async onMutate(newValues) {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await utils.team.appRole.getPermissions.cancel();
        // Snapshot the previous value
        const previousPermissions = utils.team.appRole.getPermissions.getData();
        // Optimistically update to the new value
        utils.team.appRole.getPermissions.setData({ appId }, (old) => {
          const teamAppRolesToUpdate = allAppRoles.filter((role) =>
            newValues.teamAppRoleIds.includes(role.id),
          );

          const updatedPermissions = old?.map((permission) => {
            if (permission.id === newValues.permissionId) {
              return {
                ...permission,
                AppPermissionsToTeamAppRoles: teamAppRolesToUpdate.map((x) => ({
                  appPermissionId: permission.id,
                  teamAppRoleId: x.id,
                  TeamAppRole: {
                    id: x.id,
                  },
                })),
              };
            }
            return permission;
          });

          return updatedPermissions;
        });

        // Return a context object with the snapshotted value
        return { previousPermissions };
      },
      onSuccess() {
        void utils.team.appRole.getUsersWithRoles.invalidate();
      },
      onError(err, _, context) {
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        utils.team.appRole.getPermissions.setData(
          { appId },
          context?.previousPermissions,
        );
        trpcErrorToastDefault(err);
      },
      onSettled() {
        // Always refetch after error or success:
        void utils.team.appRole.getUsersWithRoles.invalidate();
      },
    });

  const t = useTranslations();
  const columns = useMemo(
    () =>
      [
        columnHelper.display({
          id: "name",
          header: () => <div className="pl-2">{t("Permission")}</div>,
          cell: function Cell(info) {
            const name = useAppPermissionName(
              info.cell.row.original.id as AppPermissionId,
            );

            return (
              <div className="flex w-60 flex-row gap-3 pl-2">
                <div className="flex flex-col items-start">
                  <span
                    className={cn("font-semibold text-muted-foreground", {
                      italic: !info.cell.row.original.editable,
                    })}
                  >
                    {name}
                  </span>
                </div>
              </div>
            );
          },
        }),
        columnHelper.accessor("AppPermissionsToTeamAppRoles", {
          header: t("Roles"),
          cell: function Cell(info) {
            const selected = info.getValue().map((role) => role.teamAppRoleId);
            const appRoleDefaultNames = useAppRoleDefaultNames();

            return (
              <MultiSelect
                readonly={!info.cell.row.original.editable}
                className="w-96"
                options={allAppRoles.map((role) => ({
                  label:
                    appRoleDefaultNames[
                      role.appRoleDefaultId as AppRoleDefaultId
                    ],
                  value: role.id,
                }))}
                selected={selected}
                onChange={(newValues: string[]) => {
                  updatePermissionAssociation({
                    permissionId: info.cell.row.original.id,
                    teamAppRoleIds: newValues,
                    appId,
                  });
                }}
              />
            );
          },
        }),
      ] as FixedColumnsType<
        RouterOutputs["team"]["appRole"]["getPermissions"][number]
      >,
    [allAppRoles, appId, t, updatePermissionAssociation],
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-2.5 overflow-auto">
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
                  onClick={() => {
                    if (!row.original.editable) {
                      toast.error(t("This permission is not editable"));
                    }
                  }}
                  className={cn("hover:bg-muted/10", {
                    "cursor-not-allowed bg-card hover:bg-card":
                      !row.original.editable,
                  })}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {t("This app does not have any permissions")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

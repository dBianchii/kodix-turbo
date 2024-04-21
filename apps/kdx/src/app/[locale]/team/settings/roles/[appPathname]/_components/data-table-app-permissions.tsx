"use client";

import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type {
  AppPermissionId,
  AppRoleDefaultId,
  KodixAppId,
} from "@kdx/shared";
import type { FixedColumnsType } from "@kdx/ui/data-table";
import { useI18n } from "@kdx/locales/client";
import {
  useAppPermissionName,
  useAppRoleDefaultNames,
} from "@kdx/locales/hooks";
import { DataTable } from "@kdx/ui/data-table";
import { MultiSelect } from "@kdx/ui/multi-select";

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

  const t = useI18n();
  const columns = [
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
              <span className="font-bold">{name}</span>
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
            className="w-96"
            options={allAppRoles.map((role) => ({
              label: appRoleDefaultNames[role.id as AppRoleDefaultId],
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
  >;

  return (
    <DataTable
      columns={columns}
      data={data}
      noResultsMessage={t("This app does not have any permissions")}
    />
  );
}

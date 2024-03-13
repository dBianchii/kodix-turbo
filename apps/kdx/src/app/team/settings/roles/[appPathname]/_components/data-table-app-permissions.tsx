"use client";

import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type { KodixAppId } from "@kdx/shared";
import type { FixedColumnsType } from "@kdx/ui/data-table";
import { DataTable } from "@kdx/ui/data-table";
import { MultiSelect } from "@kdx/ui/multi-select";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<
    RouterOutputs["team"]["appRole"]["getPermissions"][number]
  >();

export function DataTableAppPermissions({
  appId,
  allAppRoles,
}: {
  appId: KodixAppId;
  allAppRoles: RouterOutputs["team"]["appRole"]["getAll"];
}) {
  const utils = api.useUtils();

  const [data] = api.team.appRole.getPermissions.useSuspenseQuery({ appId });
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

          const updatedPermissions = old?.map((user) => {
            if (user.id === newValues.permissionId) {
              return {
                ...user,
                TeamAppRole: teamAppRolesToUpdate,
              };
            }
            return user;
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

  const columns = [
    columnHelper.accessor("name", {
      header: () => <div className="pl-2">Permission</div>,
      cell: (info) => (
        <div className="flex w-60 flex-row gap-3 pl-2">
          <div className="flex flex-col items-start">
            <span className="font-bold">{info.cell.row.original.name}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("TeamAppRole", {
      header: "Roles",
      cell: function Cell(info) {
        const selected = info.getValue().map((role) => role.id);
        console.log(allAppRoles);
        return (
          <MultiSelect
            className="w-96"
            options={allAppRoles.map((role) => ({
              label: role.name,
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
      noResultsMessage="This app does not have any permissions"
    ></DataTable>
  );
}

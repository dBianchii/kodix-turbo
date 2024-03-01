"use client";

import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import type { KodixAppId } from "@kdx/shared";
import type { FixedColumnsType } from "@kdx/ui/data-table";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { DataTable } from "@kdx/ui/data-table";
import { MultiSelect } from "@kdx/ui/multi-select";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

const columnHelper =
  createColumnHelper<
    RouterOutputs["team"]["appRole"]["getUsersWithRoles"][number]
  >();

export function DataTableUserAppRoles({
  initialUsers,
  allAppRoles,
  appId,
}: {
  initialUsers: RouterOutputs["team"]["appRole"]["getUsersWithRoles"];
  allAppRoles: RouterOutputs["team"]["appRole"]["getAll"];
  appId: KodixAppId;
}) {
  const utils = api.useUtils();

  const { data } = api.team.appRole.getUsersWithRoles.useQuery(
    { appId },
    {
      refetchOnMount: false,
      initialData: initialUsers,
    },
  );
  const { mutate: updateUserAssociation } =
    api.team.appRole.updateUserAssociation.useMutation({
      async onMutate(newValues) {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await utils.team.appRole.getUsersWithRoles.cancel();
        // Snapshot the previous value
        const previousUsers = utils.team.appRole.getUsersWithRoles.getData();
        // Optimistically update to the new value
        utils.team.appRole.getUsersWithRoles.setData({ appId }, (old) => {
          const teamAppRolesToUpdate = allAppRoles.filter((role) =>
            newValues.teamAppRoleIds.includes(role.id),
          );

          const updatedUsers = old?.map((user) => {
            if (user.id === newValues.userId) {
              return {
                ...user,
                TeamAppRole: teamAppRolesToUpdate,
              };
            }
            return user;
          });

          return updatedUsers;
        });

        // Return a context object with the snapshotted value
        return { previousUsers };
      },
      onSuccess() {
        void utils.team.appRole.getUsersWithRoles.invalidate();
      },
      onError(err, _, context) {
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        utils.team.appRole.getUsersWithRoles.setData(
          { appId },
          context?.previousUsers,
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
      header: () => <div className="pl-2">User</div>,
      cell: (info) => (
        <div className="flex w-60 flex-row gap-3  pl-2">
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
    }),
    columnHelper.accessor("TeamAppRole", {
      header: "Roles",
      cell: function Cell(info) {
        const selected = info.getValue().map((role) => role.id);

        return (
          <MultiSelect
            className="w-96"
            options={allAppRoles.map((role) => ({
              label: role.name,
              value: role.id,
            }))}
            selected={selected}
            onChange={(newValues: string[]) => {
              updateUserAssociation({
                userId: info.cell.row.original.id,
                teamAppRoleIds: newValues,
                appId,
              });
            }}
          />
        );
      },
    }),
  ] as FixedColumnsType<
    RouterOutputs["team"]["appRole"]["getUsersWithRoles"][number]
  >;

  return <DataTable columns={columns} data={data}></DataTable>;
}

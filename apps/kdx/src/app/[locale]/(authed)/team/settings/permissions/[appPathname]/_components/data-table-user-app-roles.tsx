"use client";

import { use, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import type { RouterOutputs } from "@kdx/api";
import type { AppRole, KodixAppId } from "@kdx/shared";
import type { FixedColumnsType } from "@kdx/ui/data-table/data-table";
import { useAppRoleNames } from "@kdx/locales/next-intl/hooks";
import { allRoles, typedObjectEntries } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { DataTable } from "@kdx/ui/data-table/data-table";
import { MultiSelect } from "@kdx/ui/multi-select";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";

const columnHelper =
  createColumnHelper<
    RouterOutputs["team"]["appRole"]["getUsersWithRoles"][number]
  >();

export function DataTableUserAppRoles({
  initialUsersPromise,
  appId,
}: {
  initialUsersPromise: Promise<
    RouterOutputs["team"]["appRole"]["getUsersWithRoles"]
  >;
  appId: KodixAppId;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const appRoleDefaultNames = useAppRoleNames();
  const { data } = useQuery(
    trpc.team.appRole.getUsersWithRoles.queryOptions(
      { appId },
      {
        initialData: use(initialUsersPromise),
      },
    ),
  );

  const { mutate: updateUserAssociation } = useMutation(
    trpc.team.appRole.updateUserAssociation.mutationOptions({
      async onMutate(newValues) {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(
          trpc.team.appRole.getUsersWithRoles.pathFilter(),
        );
        // Snapshot the previous value
        const previousUsers = queryClient.getQueryData(
          trpc.team.appRole.getUsersWithRoles.queryKey(),
        );
        // Optimistically update to the new value
        queryClient.setQueryData(
          trpc.team.appRole.getUsersWithRoles.queryKey({ appId }),
          (old) => {
            if (!old) return old;
            return old.map((user) => {
              if (user.id === newValues.userId) {
                return {
                  ...user,
                  UserTeamAppRoles: user.UserTeamAppRoles.filter(
                    (role) => !Object.hasOwn(newValues.roles, role.role),
                  ).concat(
                    typedObjectEntries(newValues.roles)
                      .filter(([, isActive]) => isActive)
                      .map(([role]) => ({
                        role: role,
                        userId: newValues.userId,
                      })),
                  ),
                };
              }
              return user;
            });
          },
        );

        // Return a context object with the snapshotted value
        return { previousUsers };
      },
      onSuccess() {
        void queryClient.invalidateQueries(
          trpc.team.appRole.getUsersWithRoles.pathFilter(),
        );
      },
      onError(err, _, context) {
        // If the mutation fails,
        // use the context returned from onMutate to roll back
        queryClient.setQueryData(
          trpc.team.appRole.getUsersWithRoles.queryKey({ appId }),
          context?.previousUsers,
        );
        trpcErrorToastDefault(err);
      },
      onSettled() {
        // Always refetch after error or success:
        void queryClient.invalidateQueries(
          trpc.team.appRole.getUsersWithRoles.pathFilter(),
        );
      },
    }),
  );
  const t = useTranslations();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("name", {
          header: () => <div className="pl-2">{t("User")}</div>,
          cell: (info) => (
            <div className="flex w-60 flex-row gap-3 pl-2">
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
        columnHelper.accessor("UserTeamAppRoles", {
          header: t("Roles"),
          cell: function Cell(info) {
            const selected = info
              .getValue()
              .map((userTeamAppRoles) => userTeamAppRoles.role);

            return (
              <MultiSelect
                className="w-96"
                options={allRoles.map((role) => ({
                  label: appRoleDefaultNames[role],
                  value: role,
                }))}
                selected={selected}
                onChange={(newValues: string[]) => {
                  const rolesUnion = [
                    ...new Set([...selected, ...newValues]),
                  ] as AppRole[];

                  const updatedRoles = rolesUnion.reduce(
                    (acc, role) => {
                      // If the role was selected but is no longer selected, mark it as false.
                      if (
                        selected.includes(role) &&
                        !newValues.includes(role)
                      ) {
                        acc[role] = false;
                      }
                      // If the role was not selected before but is now selected, mark it as true.
                      else if (
                        !selected.includes(role) &&
                        newValues.includes(role)
                      ) {
                        acc[role] = true;
                      }
                      // If the role was selected and is still selected, we do nothing.
                      return acc;
                    },
                    {} as Record<AppRole, boolean>,
                  );

                  updateUserAssociation({
                    userId: info.cell.row.original.id,
                    roles: updatedRoles,
                    appId,
                  });
                }}
              />
            );
          },
        }),
      ] as FixedColumnsType<
        RouterOutputs["team"]["appRole"]["getUsersWithRoles"][number]
      >,
    [appId, appRoleDefaultNames, t, updateUserAssociation],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} showPagination={false} />;
}

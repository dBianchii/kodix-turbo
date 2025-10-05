"use client";

import type { AppRole, KodixAppId } from "@kodix/shared/db";
import type { FixedColumnsType } from "@kodix/ui/data-table/data-table";
import { use, useMemo } from "react";
import { allRoles } from "@kodix/shared/db";
import { typedObjectEntries } from "@kodix/shared/utils";
import { AvatarWrapper } from "@kodix/ui/avatar-wrapper";
import MultipleSelector from "@kodix/ui/origin-ui/multi-select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kodix/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import type { RouterOutputs } from "@kdx/api";
import { useTRPC } from "@kdx/api/trpc/react/client";
import { getAppRoleNames } from "@kdx/locales/next-intl/hooks";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";

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
  const t = useTranslations();

  const appRoleDefaultNames = getAppRoleNames(t);
  const { data } = useQuery(
    trpc.team.appRole.getUsersWithRoles.queryOptions(
      { appId },
      {
        initialData: use(initialUsersPromise),
      },
    ),
  );

  const { mutate: updateUserAssociation } = useMutation(
    // biome-ignore assist/source/useSortedKeys: Known TS limitation in tanstack
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
                        role,
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
      onSuccess() {
        void queryClient.invalidateQueries(
          trpc.team.appRole.getUsersWithRoles.pathFilter(),
        );
      },
    }),
  );

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("name", {
          cell: (info) => (
            <div className="flex w-60 flex-row gap-3 pl-2">
              <div className="flex flex-col">
                <AvatarWrapper
                  className="h-8 w-8"
                  fallback={info.getValue()}
                  src={info.cell.row.original.image ?? ""}
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
          header: () => <div className="pl-2">{t("User")}</div>,
        }),
        columnHelper.accessor("UserTeamAppRoles", {
          cell(info) {
            const selected = info
              .getValue()
              .map((userTeamAppRoles) => userTeamAppRoles.role);

            const options = allRoles.map((role) => ({
              label: appRoleDefaultNames[role],
              value: role,
            }));

            return (
              <MultipleSelector
                commandProps={{
                  label: "Select frameworks",
                }}
                defaultOptions={options}
                emptyIndicator={
                  <p className="text-center text-sm">No results found</p>
                }
                hideClearAllButton
                hidePlaceholderWhenSelected
                onChange={(newValues) => {
                  const rolesUnion = [
                    ...new Set([
                      ...selected,
                      ...newValues.map((option) => option.value),
                    ]),
                  ] as AppRole[];
                  const updatedRoles = rolesUnion.reduce(
                    (acc, role) => {
                      // If the role was selected but is no longer selected, mark it as false.
                      if (
                        selected.includes(role) &&
                        !newValues.some((option) => option.value === role)
                      ) {
                        acc[role] = false;
                      }
                      // If the role was not selected before but is now selected, mark it as true.
                      else if (
                        !selected.includes(role) &&
                        newValues.some((option) => option.value === role)
                      ) {
                        acc[role] = true;
                      }
                      // If the role was selected and is still selected, we do nothing.
                      return acc;
                    },
                    {} as Record<AppRole, boolean>,
                  );
                  updateUserAssociation({
                    appId,
                    roles: updatedRoles,
                    userId: info.cell.row.original.id,
                  });
                }}
                options={options}
                placeholder={"Select roles"}
                value={options.filter((option) =>
                  selected.includes(option.value),
                )}
              />
            );
          },
          header: t("Roles"),
        }),
      ] as FixedColumnsType<
        RouterOutputs["team"]["appRole"]["getUsersWithRoles"][number]
      >,
    [appId, appRoleDefaultNames, t, updateUserAssociation],
  );

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full caption-bottom text-sm">
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
              data-state={row.getIsSelected() && "selected"}
              key={row.id}
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
            <TableCell
              className="h-24 text-center"
              colSpan={table.getAllColumns().length}
            >
              {t("No results found")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </table>
  );
}

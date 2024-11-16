"use client";

import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";
import {
  LuArrowRight,
  LuCheck,
  LuLoader2,
  LuLock,
  LuPlus,
  LuText,
} from "react-icons/lu";

import type { RouterOutputs } from "@kdx/api";
import type { User } from "@kdx/auth";
import dayjs from "@kdx/dayjs";
import { kodixCareRoleDefaultIds } from "@kdx/shared";
import { AvatarWrapper } from "@kdx/ui/avatar-wrapper";
import { Button } from "@kdx/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@kdx/ui/credenza";
import { DataTable } from "@kdx/ui/data-table/data-table";
import { DataTableColumnHeader } from "@kdx/ui/data-table/data-table-column-header";
import { DataTableViewOptions } from "@kdx/ui/data-table/data-table-view-options";
import { DateTimePicker24h } from "@kdx/ui/date-n-time/date-time-picker-24h";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";
import { ZCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

const useTable = (
  data: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"],
) => {
  const format = useFormatter();
  const t = useTranslations();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "Shift ended",
        header: () => null,
        cell: (ctx) => {
          if (ctx.row.original.checkOut) return <LuLock />;
          return null;
        },
      }),
      columnHelper.accessor("startAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Shift start")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <span className="font-semibold">
                {format.dateTime(ctx.row.original.startAt, "shortWithHours")}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("endAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Shift end")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <span className="font-semibold">
                {format.dateTime(ctx.row.original.endAt, "shortWithHours")}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("checkIn", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            <LuCheck className="mr-2 size-4 text-green-400" />
            {t("Check in")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <div className="w-8"></div>
              <span className="font-semibold">
                {ctx.row.original.checkIn &&
                  format.dateTime(ctx.row.original.checkIn, "shortWithHours")}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("checkOut", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Check out")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center">
              <span className="font-semibold">
                {ctx.row.original.checkOut &&
                  format.dateTime(ctx.row.original.checkOut, "shortWithHours")}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("caregiverId", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} className="ml-8">
            {t("Caregiver")}
          </DataTableColumnHeader>
        ),
        cell: (ctx) => {
          return (
            <div className="flex flex-row items-center gap-2">
              <AvatarWrapper
                className="size-6"
                fallback={ctx.row.original.Caregiver.name}
                src={ctx.row.original.Caregiver.image ?? ""}
              />
              <span className="text-muted-foreground">
                {ctx.row.original.Caregiver.name}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "Notes",
        header: () => null,
        cell: (ctx) => {
          if (ctx.row.original.notes)
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LuText className="mr-2 size-4 text-orange-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs truncate">
                      {ctx.row.original.notes}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          return;
        },
      }),
    ],
    [format, t],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return { table };
};

const columnHelper =
  createColumnHelper<
    RouterOutputs["app"]["kodixCare"]["getAllCareShifts"][number]
  >();

export function DataTableShifts({
  user,
  myRoles,
  initialShifts,
  careGivers,
}: {
  user: User;
  myRoles: RouterOutputs["team"]["appRole"]["getMyRoles"];
  initialShifts: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"];
  careGivers: RouterOutputs["app"]["kodixCare"]["getAllCaregivers"];
}) {
  const query = api.app.kodixCare.getAllCareShifts.useQuery(undefined, {
    initialData: initialShifts,
  });

  const { table } = useTable(query.data);

  return (
    <>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <div className="flex gap-2 sm:mr-auto">
          <CreateShiftCredenzaButton
            careGivers={careGivers}
            user={user}
            myRoles={myRoles}
          />
        </div>

        <DataTableViewOptions table={table} />
      </div>
      <div className="mt-4">
        <DataTable table={table} showPagination={false} />
      </div>
    </>
  );
}

function CreateShiftCredenzaButton({
  user,
  myRoles,
  careGivers,
}: {
  user: User;
  myRoles: RouterOutputs["team"]["appRole"]["getMyRoles"];
  careGivers: RouterOutputs["app"]["kodixCare"]["getAllCaregivers"];
}) {
  const [open, setOpen] = useState(false);
  const [warnOverlappingShiftsOpen, setWarnOverlappingShiftsOpen] =
    useState(false);

  const shouldAutoSelectMyself =
    !myRoles.some(
      (x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
    ) &&
    myRoles.some(
      (x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.careGiver,
    );

  const utils = api.useUtils();
  const t = useTranslations();
  const form = useForm({
    schema: ZCreateCareShiftInputSchema(t),
    defaultValues: {
      careGiverId: shouldAutoSelectMyself ? user.id : undefined,
    },
  });

  const mutation = api.app.kodixCare.createCareShift.useMutation({
    onError: trpcErrorToastDefault,
    onSettled: () => {
      void utils.app.kodixCare.getAllCareShifts.invalidate();
    },
    onSuccess: () => {
      setOpen(false);
    },
  });

  const findOverlappingShiftsQuery =
    api.app.kodixCare.findOverlappingShifts.useQuery(
      {
        start: form.watch("startAt"),
        end: form.watch("endAt"),
      },
      {
        enabled:
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          !!form.getValues("startAt") &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          !!form.getValues("endAt") &&
          dayjs(form.getValues("startAt")).isBefore(
            dayjs(form.getValues("endAt")),
          ),
      },
    );

  return (
    <Credenza
      open={open}
      onOpenChange={(open) => {
        form.reset();
        setOpen(open);
      }}
    >
      <CredenzaTrigger asChild>
        <Button size={"sm"}>
          <LuPlus className="mr-2" />
          {t("apps.kodixCare.Create shift")}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-[750px]">
        {findOverlappingShiftsQuery.data && (
          <WarnOverlappingShifts
            overlaps={findOverlappingShiftsQuery.data}
            onClickConfirm={() => {
              mutation.mutate({
                startAt: form.getValues("startAt"),
                endAt: form.getValues("endAt"),
                careGiverId: form.getValues("careGiverId"),
              });
            }}
            open={warnOverlappingShiftsOpen}
            setOpen={setWarnOverlappingShiftsOpen}
          />
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              let overlappingShiftsData = findOverlappingShiftsQuery.data;

              if (!overlappingShiftsData) {
                const { data } = await findOverlappingShiftsQuery.refetch();
                overlappingShiftsData = data;
              }

              if (overlappingShiftsData?.length) {
                setWarnOverlappingShiftsOpen(true);
                return;
              }

              mutation.mutate(values); //Mutate the value if there are no overlapping shifts
            })}
          >
            <CredenzaHeader>
              <CredenzaTitle>{t("apps.kodixCare.Create shift")}</CredenzaTitle>
            </CredenzaHeader>
            <CredenzaBody className="grid gap-4 py-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Start")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            date={field.value}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
                <LuArrowRight className="mt-8 size-6 self-center" />
                <FormField
                  control={form.control}
                  name="endAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("End")}</FormLabel>
                      <FormControl>
                        <div className="flex flex-row gap-2">
                          <DateTimePicker24h
                            date={field.value}
                            setDate={(newDate) =>
                              field.onChange(newDate ?? new Date())
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="w-full" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="careGiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Caregiver")}</FormLabel>
                    <div className="flex flex-row gap-2">
                      <Select
                        disabled={
                          !myRoles.some(
                            (x) =>
                              x.appRoleDefaultId ===
                              kodixCareRoleDefaultIds.admin,
                          )
                        }
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            id="select-40"
                            className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
                          >
                            <SelectValue
                              placeholder={t("Select a caregiver")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                          {careGivers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <span className="flex items-center gap-2">
                                <AvatarWrapper
                                  className="size-10 rounded-full"
                                  src={user.image ?? ""}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                />
                                <span>
                                  <span className="block font-medium">
                                    {user.name}
                                  </span>
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage className="w-full" />
                  </FormItem>
                )}
              />
            </CredenzaBody>
            <CredenzaFooter className="mt-6 justify-end">
              <Button
                disabled={findOverlappingShiftsQuery.isFetching}
                type="submit"
              >
                {findOverlappingShiftsQuery.isFetching ? (
                  <>
                    <LuLoader2 className="mr-2 size-4 animate-spin" />
                    {t("Checking")}...
                  </>
                ) : (
                  t("Create")
                )}
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}

function WarnOverlappingShifts({
  overlaps,
  onClickConfirm,
  open,
  setOpen,
}: {
  overlaps: RouterOutputs["app"]["kodixCare"]["findOverlappingShifts"];
  onClickConfirm: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const format = useFormatter();
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="mt-6">
          <DialogTitle>
            {t("It seems that there are some overlapping shifts")}
          </DialogTitle>
        </DialogHeader>
        {overlaps.length ? (
          <ul className="my-4 list-disc rounded-md border p-4 pl-5">
            {overlaps.map((overlap) => (
              <li key={overlap.id} className="mb-2 flex items-center gap-2">
                <AvatarWrapper
                  className="size-6"
                  src={overlap.Caregiver.image ?? ""}
                  fallback={overlap.Caregiver.name}
                />
                {overlap.Caregiver.name}:
                <span className="text-muted-foreground">
                  {`${format.dateTime(overlap.startAt, "shortWithHours")} - ${format.dateTime(overlap.endAt, "shortWithHours")}`}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <DialogDescription>
          {t("Are you sure you want to create a shift anyways")}
        </DialogDescription>
        <DialogFooter className="gap-3 sm:justify-between">
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button onClick={onClickConfirm}>{t("Confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

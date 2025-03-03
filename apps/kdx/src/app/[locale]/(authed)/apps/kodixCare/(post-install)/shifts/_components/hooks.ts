import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { RouterOutputs } from "@kdx/api";
import type { TEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { getErrorMessage } from "@kdx/shared";
import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";

export const useCareShiftsData = (
  initialShifts: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"],
) => {
  const api = useTRPC();
  return useQuery(
    api.app.kodixCare.getAllCareShifts.queryOptions(undefined, {
      initialData: initialShifts,
    }),
  );
};

export const useEditCareShift = () => {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const mutation = useMutation(
    api.app.kodixCare.editCareShift.mutationOptions({
      onMutate: async (newShift) => {
        await queryClient.cancelQueries(
          api.app.kodixCare.getAllCareShifts.pathFilter(),
        );
        const previousData = queryClient.getQueryData(
          api.app.kodixCare.getAllCareShifts.queryKey(),
        );
        queryClient.setQueryData(
          api.app.kodixCare.getAllCareShifts.queryKey(),
          (old) =>
            old?.map((shift) =>
              shift.id === newShift.id
                ? {
                    ...shift,
                    startAt: newShift.startAt
                      ? new Date(newShift.startAt)
                      : shift.startAt,
                    endAt: newShift.endAt
                      ? new Date(newShift.endAt)
                      : shift.endAt,
                  }
                : shift,
            ),
        );
        return { previousData };
      },
      onError: (err, _newShift, context) => {
        trpcErrorToastDefault(err);
        if (context?.previousData) {
          queryClient.setQueryData(
            api.app.kodixCare.getAllCareShifts.queryKey(),
            context.previousData,
          );
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries(
          api.app.kodixCare.findOverlappingShifts.pathFilter(),
        );
        void queryClient.invalidateQueries(
          api.app.kodixCare.getAllCareShifts.pathFilter(),
        );
      },
    }),
  );

  const mutateAsync = async (values: TEditCareShiftInputSchema) =>
    await toast
      .promise(mutation.mutateAsync(values), {
        loading: t("Updating"),
        success: t("Updated"),
        error: getErrorMessage,
      })
      .unwrap();

  return { ...mutation, mutateAsync };
};

export const useShiftOverlap = ({
  startAt,
  endAt,
  excludeId,
}: {
  startAt: Date | undefined;
  endAt: Date | undefined;
  excludeId?: string;
}) => {
  const api = useTRPC();
  const query = useQuery(
    api.app.kodixCare.findOverlappingShifts.queryOptions(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        start: startAt!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        end: endAt!,
      },
      {
        enabled: Boolean(
          startAt && endAt && dayjs(startAt).isBefore(dayjs(endAt)),
        ),
      },
    ),
  );

  const overlappingShifts = useMemo(
    () => query.data?.filter((shift) => shift.id !== excludeId),
    [query.data, excludeId],
  );

  return {
    overlappingShifts,
    isChecking: query.isFetching,
  };
};

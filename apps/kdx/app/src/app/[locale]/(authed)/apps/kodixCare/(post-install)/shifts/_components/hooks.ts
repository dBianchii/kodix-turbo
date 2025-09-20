import { useMemo } from "react";
import dayjs from "@kodix/dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";

export const useCareShiftsData = () => {
  const trpc = useTRPC();
  const query = useQuery(trpc.app.kodixCare.getAllCareShifts.queryOptions());
  return query;
};

export const useEditCareShift = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    trpc.app.kodixCare.editCareShift.mutationOptions({
      onMutate: async (newShift) => {
        await queryClient.cancelQueries(
          trpc.app.kodixCare.getAllCareShifts.pathFilter(),
        );
        const previousData = queryClient.getQueryData(
          trpc.app.kodixCare.getAllCareShifts.queryKey(),
        );
        queryClient.setQueryData(
          trpc.app.kodixCare.getAllCareShifts.queryKey(),
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
            trpc.app.kodixCare.getAllCareShifts.queryKey(),
            context.previousData,
          );
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.findOverlappingShifts.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.getAllCareShifts.pathFilter(),
        );
      },
    }),
  );

  return mutation;
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
  const trpc = useTRPC();
  const query = useQuery(
    trpc.app.kodixCare.findOverlappingShifts.queryOptions(
      {
        // biome-ignore lint/style/noNonNullAssertion: <biome migration>
        start: startAt!,
        // biome-ignore lint/style/noNonNullAssertion: <biome migration>
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

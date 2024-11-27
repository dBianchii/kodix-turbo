import { useMemo } from "react";

import type { RouterOutputs } from "@kdx/api";
import dayjs from "@kdx/dayjs";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

export const useCareShiftsData = (
  initialShifts: RouterOutputs["app"]["kodixCare"]["getAllCareShifts"],
) => {
  return api.app.kodixCare.getAllCareShifts.useQuery(undefined, {
    initialData: initialShifts,
  });
};

export const useEditCareShift = () => {
  const utils = api.useUtils();
  return api.app.kodixCare.editCareShift.useMutation({
    onMutate: async (newShift) => {
      await utils.app.kodixCare.getAllCareShifts.cancel();
      const previousData = utils.app.kodixCare.getAllCareShifts.getData();
      utils.app.kodixCare.getAllCareShifts.setData(undefined, (old) =>
        old?.map((shift) =>
          shift.id === newShift.id
            ? {
                ...shift,
                startAt: newShift.startAt
                  ? new Date(newShift.startAt)
                  : shift.startAt,
                endAt: newShift.endAt ? new Date(newShift.endAt) : shift.endAt,
              }
            : shift,
        ),
      );
      return { previousData };
    },
    onError: (err, _newShift, context) => {
      trpcErrorToastDefault(err);
      if (context?.previousData) {
        utils.app.kodixCare.getAllCareShifts.setData(
          undefined,
          context.previousData,
        );
      }
    },
    onSettled: () => {
      void utils.app.kodixCare.findOverlappingShifts.invalidate();
      void utils.app.kodixCare.getAllCareShifts.invalidate();
    },
  });
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
  const query = api.app.kodixCare.findOverlappingShifts.useQuery(
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

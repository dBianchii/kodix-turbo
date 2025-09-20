import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { TEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

import { getErrorMessage } from "../../../../../../../../../../../../packages/kodix/shared/src/utils";

export const useSaveCareTaskMutation = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const saveCareTaskMutation = useMutation(
    trpc.app.kodixCare.careTask.editCareTask.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.app.getAppActivityLogs.queryFilter({
            tableNames: ["careTask"],
          }),
        );
      },
    }),
  );

  const mutateAsync = (values: TEditCareTaskInputSchema) =>
    toast
      .promise(saveCareTaskMutation.mutateAsync(values), {
        loading: t("Updating"),
        success: t("Updated"),
        error: getErrorMessage,
      })
      .unwrap();

  return { ...saveCareTaskMutation, mutateAsync };
};

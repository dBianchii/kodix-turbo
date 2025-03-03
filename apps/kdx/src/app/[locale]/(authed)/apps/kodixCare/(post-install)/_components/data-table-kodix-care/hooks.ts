import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { TEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { getErrorMessage } from "@kdx/shared";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

export const useSaveCareTaskMutation = () => {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const saveCareTaskMutation = useMutation(
    api.app.kodixCare.careTask.editCareTask.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(
          api.app.kodixCare.careTask.getCareTasks.pathFilter(),
        );
        void queryClient.invalidateQueries(
          api.app.getAppActivityLogs.queryFilter({
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

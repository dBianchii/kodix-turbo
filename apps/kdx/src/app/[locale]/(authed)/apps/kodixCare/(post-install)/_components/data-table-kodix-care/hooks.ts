import { useTranslations } from "next-intl";

import type { TEditCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { getErrorMessage } from "@kdx/shared";
import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";

export const useSaveCareTaskMutation = () => {
  const utils = api.useUtils();
  const t = useTranslations();
  const saveCareTaskMutation =
    api.app.kodixCare.careTask.editCareTask.useMutation({
      onSettled: () => {
        void utils.app.kodixCare.careTask.getCareTasks.invalidate();
        void utils.app.getAppActivityLogs.invalidate({
          tableNames: ["careTask"],
        });
      },
    });

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

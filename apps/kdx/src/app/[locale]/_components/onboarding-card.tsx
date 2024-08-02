"use client";

import { useAction } from "next-safe-action/hooks";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { finishKodixCareOnboardingAction } from "../actions/onboardingActions";

export default function OnboardingCard() {
  const { execute } = useAction(finishKodixCareOnboardingAction, {
    onError: (res) => {
      defaultSafeActionToastError(res.error);
    },
  });

  return (
    <button onClick={() => execute({ patientName: "values.patientName" })}>
      Cause the error
    </button>
  );
}

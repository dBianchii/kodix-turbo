"use client";

import { finishKodixCareOnboardingAction } from "../actions/onboardingActions";

export default function OnboardingCard() {
  // const { execute } = useAction(finishKodixCareOnboardingAction, {
  //   onError: (res) => {
  //     defaultSafeActionToastError(res.error);
  //   },
  // });

  return (
    <button onClick={async () => await finishKodixCareOnboardingAction()}>
      Cause the error
    </button>
  );
}

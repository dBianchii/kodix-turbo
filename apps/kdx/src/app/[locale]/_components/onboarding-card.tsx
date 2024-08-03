"use client";

import { finishKodixCareOnboardingAction } from "../actions/onboardingActions";

export default function OnboardingCard() {
  // const { execute } = useAction(finishKodixCareOnboardingAction, {
  //   onError: (res) => {
  //     defaultSafeActionToastError(res.error);
  //   },
  // });

  return (
    <button
      onClick={async () => await finishKodixCareOnboardingAction()}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      Cause the error. Please check the server console
    </button>
  );
}

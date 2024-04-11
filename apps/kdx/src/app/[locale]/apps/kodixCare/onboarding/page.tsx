import { redirect } from "next/navigation";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import OnboardingCard from "./_components/onboarding-card";

export default async function KodixCareOnboardingPage() {
  const onboardingCompleted = await api.app.kodixCare.onboardingCompleted();
  if (onboardingCompleted) redirect("/apps/kodixCare");

  return (
    <MaxWidthWrapper>
      <div className="flex h-[450px] items-center justify-center">
        <OnboardingCard />
      </div>
    </MaxWidthWrapper>
  );
}

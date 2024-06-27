import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { kodixCareAppId } from "@kdx/shared";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import OnboardingCard from "./_components/onboarding-card";

export default async function KodixCareOnboardingPage() {
  const { user } = await auth();
  if (!session) return redirect("/");
  const installed = await api.app.getInstalled();
  if (installed.some((x) => x.id === kodixCareAppId))
    redirect("/apps/kodixCare");

  return (
    <MaxWidthWrapper>
      <div className="flex h-[450px] items-center justify-center">
        <OnboardingCard />
      </div>
    </MaxWidthWrapper>
  );
}

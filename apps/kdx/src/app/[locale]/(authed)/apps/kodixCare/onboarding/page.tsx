import { getLocale } from "next-intl/server";

import { auth } from "@kdx/auth";
import { redirect } from "@kdx/locales/next-intl/navigation";
import { kodixCareAppId } from "@kdx/shared";

import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import OnboardingCard from "./_components/onboarding-card";

export default async function KodixCareOnboardingPage() {
  const { user } = await auth();
  if (!user) redirect({ href: "/", locale: await getLocale() });

  const installed = await api.app.getInstalled();
  if (installed.some((x) => x.id === kodixCareAppId))
    return redirect({
      href: "/apps/kodixCare",
      locale: await getLocale(),
    });

  return (
    <MaxWidthWrapper>
      <main>
        <div className="flex h-[450px] items-center justify-center">
          <OnboardingCard />
        </div>
      </main>
    </MaxWidthWrapper>
  );
}

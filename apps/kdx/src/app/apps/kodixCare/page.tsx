import { HiUserCircle } from "react-icons/hi";

import { prisma } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { redirectIfAppNotInstalled } from "~/helpers/miscelaneous/serverHelpers";
import { api } from "~/trpc/server";
import KodixCareTable from "./_components/kodix-care-table";
import StartShiftButton from "./_components/start-shift-button";

export const dynamic = "force-dynamic"; //TODO: help me
export default async function KodixCare() {
  await redirectIfAppNotInstalled({
    appId: kodixCareAppId,
    prisma,
    customRedirect: "/apps/kodixCare/onboarding",
  });

  await api.kodixCare.getCurrentShift();

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex w-full max-w-52 flex-col">
          <div className="flex flex-col space-y-3 pt-4">
            <h2 className="font-semibold leading-none tracking-tight">
              Current Shift
            </h2>
            <div className="flex items-center space-x-2 rounded-md">
              <HiUserCircle className="h-5 w-5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  No shift started yet
                </p>
              </div>
            </div>
            <StartShiftButton />
          </div>
        </div>
        <div className="w-full">
          <KodixCareTable />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

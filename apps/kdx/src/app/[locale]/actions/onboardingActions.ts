"use server";

import { getTranslations } from "@kdx/locales/next-intl/server"; //! THIS ONE DOESN'T WORK

// import { getTranslations } from "next-intl/server";//! This one works!! You can uncomment this line and comment the one above to see the difference

export const finishKodixCareOnboardingAction = async () => {
  const t = await getTranslations();
  console.log(t("Title"));
};

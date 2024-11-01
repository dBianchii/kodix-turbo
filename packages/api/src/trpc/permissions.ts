import { TRPCError } from "@trpc/server";

import { getTranslations } from "@kdx/locales/next-intl/server";

import type { TProtectedProcedureContext } from "./procedures";

export const assertIsUserCareGiver = async (
  ctx: TProtectedProcedureContext,
  caregiverId: string,
) => {
  const t = await getTranslations({ locale: ctx.locale });

  if (ctx.auth.user.id !== caregiverId) {
    return new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You are not the caregiver for this shift"),
    });
  }
};

// export const assertSomethingIdk = async () => {
//   const t = await getTranslations({ locale: ctx.locale });

//   if (dayjs(input.date).isBefore(dayjs(currentShift.checkOut)))
//     throw new TRPCError({
//       code: "BAD_REQUEST",
//       message: t("api.Checkout time must be after checkin time"),
//     });
// };

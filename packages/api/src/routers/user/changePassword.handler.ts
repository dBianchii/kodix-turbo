import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

import type { TChangePasswordInputSchema } from "@kdx/validators/trpc/user";
import { eq } from "@kdx/db";
import { resetPasswordTokens, users } from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";

import type { TPublicProcedureContext } from "../../procedures";
import { argon2Config } from "./utils";

interface ChangePasswordOptions {
  ctx: TPublicProcedureContext;
  input: TChangePasswordInputSchema;
}

export const changePasswordHandler = async ({
  ctx,
  input,
}: ChangePasswordOptions) => {
  const existingToken = await ctx.db.query.resetPasswordTokens.findFirst({
    where: (resetPasswordTokens, { eq }) =>
      eq(resetPasswordTokens.token, input.token),
    columns: {
      userId: true,
    },
  });
  if (!existingToken) {
    const t = await getTranslations({ locale: ctx.locale });

    throw new TRPCError({
      code: "NOT_FOUND",
      message: t("api.Token not found"),
    });
  }
  const hashed = await hash(input.password, argon2Config);
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(resetPasswordTokens)
      .where(eq(resetPasswordTokens.token, input.token));
    await tx
      .update(users)
      .set({
        passwordHash: hashed,
      })
      .where(eq(users.id, existingToken.userId));
  });
};

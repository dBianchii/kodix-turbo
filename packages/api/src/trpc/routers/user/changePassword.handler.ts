import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TChangePasswordInputSchema } from "@kdx/validators/trpc/user";
import { eq, lte, or } from "@kdx/db";
import { resetPasswordTokens, users } from "@kdx/db/schema";

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
      tokenExpiresAt: true,
    },
  });

  if (!existingToken) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Token not found"),
    });
  }
  if (existingToken.tokenExpiresAt <= new Date()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.Token expired Please request your password change again",
      ),
    });
  }

  const hashed = await hash(input.password, argon2Config);
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(resetPasswordTokens)
      .where(
        or(
          eq(resetPasswordTokens.token, input.token),
          lte(resetPasswordTokens.tokenExpiresAt, new Date()),
        ),
      );
    await tx
      .update(users)
      .set({
        passwordHash: hashed,
      })
      .where(eq(users.id, existingToken.userId));
  });
};

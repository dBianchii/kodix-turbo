import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

import type { TChangePasswordInputSchema } from "@kdx/validators/trpc/user";
import { eq } from "@kdx/db";
import * as schema from "@kdx/db/schema";

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
      eq(schema.resetPasswordTokens.token, input.token),
    columns: {
      userId: true,
    },
  });
  if (!existingToken)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Token not found",
    });

  const hashed = await hash(input.password, argon2Config);
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(schema.resetPasswordTokens)
      .where(eq(schema.resetPasswordTokens.token, input.token));
    await tx
      .update(schema.users)
      .set({
        passwordHash: hashed,
      })
      .where(eq(schema.users.id, existingToken.userId));
  });
};

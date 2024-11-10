import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

import type { TChangePasswordInputSchema } from "@kdx/validators/trpc/user";
import { argon2Config } from "@kdx/auth";
import { db } from "@kdx/db/client";
import { authRepository, userRepository } from "@kdx/db/repositories";

import type { TPublicProcedureContext } from "../../procedures";

interface ChangePasswordOptions {
  ctx: TPublicProcedureContext;
  input: TChangePasswordInputSchema;
}

export const changePasswordHandler = async ({
  ctx,
  input,
}: ChangePasswordOptions) => {
  const existingToken = await authRepository.findResetPasswordTokenByToken(
    input.token,
  );

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
  await db.transaction(async (tx) => {
    await authRepository.deleteTokenAndDeleteExpiredTokens(tx, input.token);
    await userRepository.updateUser(tx, {
      id: existingToken.userId,
      input: { passwordHash: hashed },
    });
  });
};

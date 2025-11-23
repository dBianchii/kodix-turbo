import { createDbSessionAndCookie } from "@cash/auth";
import {
  caRepository,
  magicLinkRepository,
  userRepository,
} from "@cash/db/repositories";
import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../procedures";
import type { TVerifyMagicLinkInputSchema } from "../../schemas/auth";

interface VerifyMagicLinkHandlerInput {
  ctx: TPublicProcedureContext;
  input: TVerifyMagicLinkInputSchema;
}

export async function verifyMagicLinkHandler({
  ctx: _,
  input,
}: VerifyMagicLinkHandlerInput) {
  const magicLinkToken = await magicLinkRepository.findMagicLinkByToken(
    input.token,
  );

  if (!magicLinkToken) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Token inválido",
    });
  }

  const now = new Date();
  const expiresAt = new Date(magicLinkToken.expiresAt);
  if (now > expiresAt) {
    await magicLinkRepository.deleteToken(input.token);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Token expirado",
    });
  }

  const client = await caRepository.findClientById(magicLinkToken.clientId);

  if (!client?.email) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Cliente não encontrado",
    });
  }

  let user: { id: string } | undefined = await userRepository.findUserByEmail(
    client.email,
  );

  if (!user) {
    const [newUser] = await userRepository.createUser({
      clientId: client.id,
      email: client.email,
      name: client.name,
    });

    if (!newUser) {
      throw new Error("Failed to create user");
    }
    user = newUser;
  }

  await createDbSessionAndCookie({ userId: user.id });

  await magicLinkRepository.deleteToken(input.token);
}

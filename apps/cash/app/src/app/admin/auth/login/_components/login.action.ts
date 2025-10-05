"use server";

import { redirect } from "next/navigation";
import { publicAction } from "@cash/api/trpc/react/server";
import {
  createDbSessionAndCookie,
  validateUserEmailAndPassword,
} from "@cash/auth";

import { ZLoginSchema } from "./login.schema";

export const loginAction = publicAction
  .input(ZLoginSchema)
  .mutation(async ({ input: { email, password } }) => {
    const user = await validateUserEmailAndPassword({ email, password });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    await createDbSessionAndCookie({ userId: user.id });

    redirect("/admin");
  });

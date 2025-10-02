"use server";

import { redirect } from "next/navigation";
import {
  createDbSessionAndCookie,
  validateUserEmailAndPassword,
} from "@cash/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    throw new Error("Invalid form data");
  }

  try {
    const user = await validateUserEmailAndPassword({ email, password });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    await createDbSessionAndCookie({ userId: user.id });

    redirect("/admin");
  } catch (error) {
    throw new Error("Login failed");
  }
}

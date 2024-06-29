"use client";

import type { TransitionStartFunction } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { LuLoader2 } from "react-icons/lu";
import { RxDiscordLogo } from "react-icons/rx";

import { useI18n, useScopedI18n } from "@kdx/locales/client";
import { cn } from "@kdx/ui";
import { Button, buttonVariants } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { signInAction } from "../actions";

export function SignInButtons({
  searchParams,
  renderDiscord,
}: {
  searchParams?: Record<string, string | undefined>;
  renderDiscord: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useScopedI18n("signin");
  return (
    <>
      <PasswordSignIn
        callbackUrl={searchParams?.callbackUrl}
        loading={isPending}
        startTransition={startTransition}
      />
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("Or continue with")}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <GoogleSignIn callbackUrl={searchParams?.callbackUrl} />
        {renderDiscord && (
          <DiscordSignIn callbackUrl={searchParams?.callbackUrl} />
        )}
      </div>
    </>
  );
}

function PasswordSignIn({
  callbackUrl,
  loading,
  startTransition,
}: {
  callbackUrl?: string;
  loading: boolean;
  startTransition: TransitionStartFunction;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const t = useScopedI18n("signin");
  return (
    <>
      <div>
        <Label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {t("Your email")}
        </Label>
        <Input
          type="email"
          placeholder="name@email.com"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <Label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {t("Your password")}
        </Label>
        <Input
          type="password"
          placeholder="********"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button
        variant="default"
        onClick={() => {
          startTransition(async () => {
            const result = await signInAction({
              email,
              password,
              callbackUrl,
            });
            if (!defaultSafeActionToastError(result)) return;
          });
        }}
        disabled={loading}
        className="mt-4 w-full"
      >
        {t("Sign in")}
        {loading && <LuLoader2 className="ml-2 size-4 animate-spin" />}
      </Button>
    </>
  );
}

function GoogleSignIn({ callbackUrl }: { callbackUrl?: string }) {
  const t = useI18n();
  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      href={
        callbackUrl
          ? `/api/auth/google/login?callbackUrl=${callbackUrl}`
          : "/api/auth/google/login"
      }
    >
      <FcGoogle className="mr-2 size-4" />
      {t("Sign in with Google")}
    </Link>
  );
}
function DiscordSignIn({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      href={
        callbackUrl
          ? `/api/auth/discord/login?callbackUrl=${callbackUrl}`
          : "/api/auth/discord/login"
      }
    >
      <RxDiscordLogo className="mr-2 size-4" />
      Sign in with Discord
    </Link>
  );
}

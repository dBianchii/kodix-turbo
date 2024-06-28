"use client";

import type { TransitionStartFunction } from "react";
import { useState, useTransition } from "react";
import { LuLoader2 } from "react-icons/lu";

import { useScopedI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { signupAction } from "../actions";

export function RegisterButtons({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useScopedI18n("signin");
  return (
    <>
      <EmailRegister
        loading={isPending}
        startTransition={startTransition}
        searchParams={searchParams}
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
      {/* <div className="space-y-2">
        <GoogleRegister
          callbackUrl={searchParams?.callbackUrl}
          loading={isPending}
          startTransition={startTransition}
        />
        {env.NODE_ENV === "development" && (
          <DiscordRegister
            callbackUrl={searchParams?.callbackUrl}
            loading={isPending}
            startTransition={startTransition}
          />
        )}
      </div> */}
    </>
  );
}

interface SignInButtonsProps {
  loading: boolean;
  startTransition: TransitionStartFunction;
  searchParams?: Record<string, string | undefined>;
}

function EmailRegister({ loading, startTransition }: SignInButtonsProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const t = useScopedI18n("signin");
  return (
    <>
      <div className="pb-4">
        <Label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {t("Your name")}
        </Label>
        <Input
          type="text"
          placeholder="joan doe"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="pb-4">
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
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {t("Password")}
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
            const result = await signupAction({
              email,
              password,
              name,
            });
            if (defaultSafeActionToastError(result)) return;
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

// function GoogleRegister({
//   callbackUrl,
//   loading,
//   startTransition,
// }: SignInButtonsProps) {
//   const t = useI18n();
//   return (
//     <Button
//       className="w-full"
//       variant="outline"
//       disabled={loading}
//       onClick={() => {
//         startTransition(async () => {
//           await signIn("google", {
//             callbackUrl,
//           });
//         });
//       }}
//     >
//       <FcGoogle className="mr-2 size-4" />
//       {t("Sign in with Google")}
//     </Button>
//   );
// }

// function DiscordRegister({
//   callbackUrl,
//   loading,
//   startTransition,
// }: SignInButtonsProps) {
//   return (
//     <Button
//       className="w-full"
//       variant="outline"
//       disabled={loading}
//       onClick={() => {
//         startTransition(async () => {
//           await signIn("discord", {
//             callbackUrl,
//           });
//         });
//       }}
//     >
//       <RxDiscordLogo className="mr-2 size-4" />
//       Sign in with Discord
//     </Button>
//   );
// }

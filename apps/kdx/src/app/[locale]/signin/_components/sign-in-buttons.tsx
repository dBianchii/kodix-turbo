"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { LuLoader2 } from "react-icons/lu";

import { useScopedI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";

export function SignInButtons({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const [disabled, setLoading] = useState(false);
  const t = useScopedI18n("signin");
  return (
    <>
      <EmailSignIn
        callbackUrl={searchParams?.callbackUrl}
        loading={disabled}
        setLoading={setLoading}
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
      <GoogleSignIn
        callbackUrl={searchParams?.callbackUrl}
        loading={disabled}
        setLoading={setLoading}
      />
    </>
  );
}

interface SignInButtonsProps {
  callbackUrl?: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

function EmailSignIn({ callbackUrl, loading, setLoading }: SignInButtonsProps) {
  const [email, setEmail] = useState("");
  const t = useScopedI18n("signin");
  return (
    <>
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
      <Button
        variant="default"
        onClick={async () => {
          setLoading(true);
          await signIn("resend", {
            email,
            callbackUrl,
          });
          setLoading(false);
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

function GoogleSignIn({
  callbackUrl,
  loading,
  setLoading,
}: SignInButtonsProps) {
  return (
    <Button
      className="w-full"
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signIn("google", {
          callbackUrl,
        });
        setLoading(false);
      }}
    >
      <FcGoogle className="mr-2 size-4" />
      Sign in with Google
    </Button>
  );
}

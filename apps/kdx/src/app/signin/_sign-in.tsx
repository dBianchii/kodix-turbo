"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { LuLoader2 } from "react-icons/lu";

import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";

export function _SignIn({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <section className="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
      <Link href="/" className="my-4 text-4xl font-extrabold">
        Kodix
      </Link>
      <Card className="w-[275px] sm:w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-bold text-lg">
            Sign in to your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center">
            <div className="flex flex-col">
              {"email" && (
                <>
                  <Label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Your email
                  </Label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    variant="default"
                    onClick={() => {
                      void signIn("email", {
                        email,
                        callbackUrl,
                      });
                      setLoading(true);
                    }}
                    className="mt-4"
                    disabled={loading}
                  >
                    Sign In
                  </Button>
                </>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {"google" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      void signIn("google", {
                        callbackUrl,
                      });
                      setLoading(true);
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FcGoogle className="mr-2 h-4 w-4" />
                    )}
                    Google
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

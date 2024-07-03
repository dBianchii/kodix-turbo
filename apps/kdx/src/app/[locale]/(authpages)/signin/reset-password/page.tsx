"use client";

import Link from "next/link";

import { useI18n } from "@kdx/locales/client";
import { cn } from "@kdx/ui";
import { Button, buttonVariants } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kdx/ui/form";
import { Input } from "@kdx/ui/input";
import { ZChangePasswordInputSchema } from "@kdx/validators/trpc/user";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { api } from "~/trpc/react";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const t = useI18n();

  const form = useForm({
    schema: ZChangePasswordInputSchema.extend({
      passwordConfirmation: ZChangePasswordInputSchema.shape.password,
    }).refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords don't match",
      path: ["passwordConfirmation"],
    }),
    defaultValues: {
      token: searchParams.token,
    },
  });

  const mutation = api.user.changePassword.useMutation({
    onError: defaultSafeActionToastError,
  });

  return (
    <section className="mx-auto flex flex-1 flex-col items-center justify-center px-6 py-8 lg:py-0">
      <Link href="/" className="my-4 text-4xl font-extrabold">
        Kodix
      </Link>
      <Card className="w-[275px] sm:w-[400px]">
        {mutation.isSuccess ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-bold text-lg">
                {t("Password updated")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("Your password has been successfully updated")}
              </CardDescription>

              <Link href="/signin" className={cn(buttonVariants())}>
                {t("Sign in with new password")}
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-bold text-lg">
                {t("Forgot password")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    mutation.mutate(values);
                  })}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Password")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder={t("Enter your password")}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="passwordConfirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Confirm password")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder={t("Enter confirm password")}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className="w-full" type="submit">
                    {t("Send reset email")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
    </section>
  );
}

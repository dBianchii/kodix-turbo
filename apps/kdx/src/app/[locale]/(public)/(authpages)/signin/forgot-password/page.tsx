"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
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
import { ZSendResetPasswordEmailInputSchema } from "@kdx/validators/trpc/user";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { Link } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";

export default function ForgotPasswordPage() {
  const trpc = useTRPC();
  const form = useForm({
    schema: ZSendResetPasswordEmailInputSchema,
  });
  const t = useTranslations();

  const mutation = useMutation(
    trpc.user.sendResetPasswordEmail.mutationOptions({
      onError: (err) => {
        trpcErrorToastDefault(err);
      },
    }),
  );

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
                {t("Password reset email sent")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t(
                  "We have sent you an email with instructions to reset your password",
                )}
              </CardDescription>
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Email")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full"
                            placeholder={t("Enter your email")}
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    className="w-full"
                    type="submit"
                    loading={mutation.isPending}
                  >
                    {t("Send reset email")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
      <Link href={"/signin"} className="mt-8 text-sm font-medium">
        {t("Go back to sign in page")}
      </Link>
    </section>
  );
}

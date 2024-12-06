"use client";

import { use } from "react";
import { useTranslations } from "next-intl";

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

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { Link } from "~/i18n/routing";
import { api } from "~/trpc/react";

export default function ForgotPasswordPage(props: {
  searchParams: Promise<{ token: string }>;
}) {
  const searchParams = use(props.searchParams);
  const t = useTranslations();

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
    onError: (err) => {
      trpcErrorToastDefault(err);
    },
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
            <CardContent className="text-center">
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
                {t("Redefine password")}
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
                            placeholder={t("Enter your new password")}
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
                        <FormLabel>{t("Confirm your new password")}</FormLabel>
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

                  <Button
                    className="w-full"
                    type="submit"
                    loading={mutation.isPending}
                  >
                    {t("Change password")}
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

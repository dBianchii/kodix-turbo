"use client";

import { use } from "react";
import { cn } from "@kodix/ui";
import { Button, buttonVariants } from "@kodix/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kodix/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@kodix/ui/form";
import { Input } from "@kodix/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useTRPC } from "@kdx/api/trpc/react/client";
import { ZChangePasswordInputSchema } from "@kdx/validators/trpc/user";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { Link } from "~/i18n/routing";

export default function ForgotPasswordPage(props: {
  searchParams: Promise<{ token: string }>;
}) {
  const trpc = useTRPC();
  const searchParams = use(props.searchParams);
  const t = useTranslations();

  const form = useForm({
    defaultValues: {
      token: searchParams.token,
    },
    schema: ZChangePasswordInputSchema.extend({
      passwordConfirmation: ZChangePasswordInputSchema.shape.password,
    }).refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords don't match",
      path: ["passwordConfirmation"],
    }),
  });

  const mutation = useMutation(
    trpc.user.changePassword.mutationOptions({
      onError: (err) => {
        trpcErrorToastDefault(err);
      },
    }),
  );

  return (
    <section className="mx-auto flex flex-1 flex-col items-center justify-center px-6 py-8 lg:py-0">
      <Link className="my-4 font-extrabold text-4xl" href="/">
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

              <Link className={cn(buttonVariants())} href="/signin">
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
                  className="space-y-6"
                  onSubmit={form.handleSubmit((values) => {
                    mutation.mutate(values);
                  })}
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
                    loading={mutation.isPending}
                    type="submit"
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

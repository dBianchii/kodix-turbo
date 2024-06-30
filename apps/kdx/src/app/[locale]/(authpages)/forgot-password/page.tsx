"use client";

import Link from "next/link";

import { useI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
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

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { resetPasswordAction } from "./actions";
import { ZForgotPasswordSchema } from "./schema";

export default function ForgotPasswordPage() {
  const form = useForm({
    schema: ZForgotPasswordSchema,
  });
  const t = useI18n();
  return (
    <section className="mx-auto flex flex-1 flex-col items-center justify-center px-6 py-8 lg:py-0">
      <Link href="/" className="my-4 text-4xl font-extrabold">
        Kodix
      </Link>
      <Card className="w-[275px] sm:w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-bold text-lg">
            {t("Forgot password")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                const result = await resetPasswordAction(values);
                if (!defaultSafeActionToastError(result)) return;
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

              <Button className="w-full" type="submit">
                {t("Send reset email")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Link href={"/signin"} className="mt-8 text-sm font-medium">
        {t("Go back to sign in page")}
      </Link>
    </section>
  );
}

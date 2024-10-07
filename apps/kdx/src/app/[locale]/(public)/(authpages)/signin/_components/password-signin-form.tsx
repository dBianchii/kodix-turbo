"use client";

import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { LuLoader2 } from "react-icons/lu";

import { useTranslations } from "@kdx/locales/next-intl/client";
import { Button } from "@kdx/ui/button";
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
import { signInAction } from "./actions";
import { ZSigninActionSchema } from "./schema";

export function PasswordSignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const t = useTranslations();
  const form = useForm({
    schema: ZSigninActionSchema,
  });
  const { execute, isExecuting } = useAction(signInAction, {
    onError: (res) => {
      defaultSafeActionToastError(res.error);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          execute({
            email: values.email,
            password: values.password,
            callbackUrl,
          });
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Your email")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>{t("Your password")}</FormLabel>
                <Link
                  href="/signin/forgot-password"
                  className="text-sm text-primary"
                >
                  {t("Forgot password")}
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="*******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="default"
          disabled={form.formState.isSubmitting || isExecuting}
          className="mt-4 w-full"
        >
          {t("Sign in")}
          {(form.formState.isSubmitting || isExecuting) && (
            <LuLoader2 className="ml-2 size-4 animate-spin" />
          )}
        </Button>
      </form>
    </Form>
  );
}

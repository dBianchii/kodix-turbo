"use client";

import Link from "next/link";
import { LuLoader2 } from "react-icons/lu";

import { useI18n } from "@kdx/locales/client";
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
  const t = useI18n();
  const form = useForm({
    schema: ZSigninActionSchema,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          const result = await signInAction({
            email: values.email,
            password: values.password,
            callbackUrl,
          });
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (result && defaultSafeActionToastError(result)) return;
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
          disabled={form.formState.isSubmitting}
          className="mt-4 w-full"
        >
          {t("Sign in")}
          {form.formState.isSubmitting && (
            <LuLoader2 className="ml-2 size-4 animate-spin" />
          )}
        </Button>
      </form>
    </Form>
  );
}

"use client";

import { buttonVariants } from "@kodix/ui/button";
import { useTranslations } from "next-intl";

import { Link } from "~/i18n/routing";

import MaxWidthWrapper from "../max-width-wrapper";
import { I18nPicker } from "./i18n-picker";
import { Logo } from "./logo";

export function StaticHeader() {
  const t = useTranslations();

  return (
    <header className="border-b py-2">
      <MaxWidthWrapper className="max-w-(--breakpoint-2xl)">
        <div className="mx-auto flex max-w-(--breakpoint-2xl) items-center">
          <Logo redirect={"/"} />

          <div className="ml-auto flex items-center space-x-4">
            <I18nPicker />

            <div className="mr-5 space-x-2">
              <Link
                className={buttonVariants({ variant: "ghost" })}
                href="/signin"
              >
                {t("header.Log in")}
              </Link>
              <Link
                className={buttonVariants({ variant: "default" })}
                href="/signup"
              >
                {t("header.Sign up")}
              </Link>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}

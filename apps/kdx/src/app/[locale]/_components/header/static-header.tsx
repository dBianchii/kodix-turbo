"use client";

import { useTranslations } from "next-intl";

import { buttonVariants } from "@kdx/ui/button";

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
                href="/signin"
                className={buttonVariants({ variant: "ghost" })}
              >
                {t("header.Log in")}
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "default" })}
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

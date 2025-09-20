"use client";

import { Button } from "@kodix/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kodix/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { PiTranslate } from "react-icons/pi";

import type { Locales } from "@kdx/locales";

import { usePathname, useRouter } from "~/i18n/routing";

export function I18nPicker() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const handleLocaleChange = (locale: Locales) => {
    router.replace(pathname, { locale: locale });
    router.refresh();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} className="size-8 p-1">
          <PiTranslate className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleLocaleChange("pt-BR")}>
          {t("Portuguese Brazil")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
          {t("English")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { PiTranslate } from "react-icons/pi";

import type { Locales } from "@kdx/locales";
import { useTranslations } from "@kdx/locales/next-intl/client";
import { usePathname, useRouter } from "@kdx/locales/next-intl/navigation";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";

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

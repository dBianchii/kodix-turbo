"use client";

import { PiTranslate } from "react-icons/pi";

import { useTranslations } from "@kdx/locales/client";
import { Link, usePathname } from "@kdx/locales/navigation";
import { Button } from "@kdx/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui/dropdown-menu";

export function I18nPicker() {
  const pathname = usePathname();
  const t = useTranslations();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} className="size-8 p-1">
          <PiTranslate className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href={pathname} locale="pt-BR">
          <DropdownMenuItem>{t("Portuguese Brazil")}</DropdownMenuItem>
        </Link>
        <Link href={pathname} locale="en">
          <DropdownMenuItem>{t("English")}</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { PiTranslate } from "react-icons/pi";

import { useChangeLocale, useI18n } from "@kdx/locales/client";
import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

export function I18nPicker() {
  const changeLocale = useChangeLocale();
  const t = useI18n();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className="size-8 p-1">
          <PiTranslate className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput placeholder={`${t("Search language")}...`} />
          <CommandEmpty>{t("No languages found")}</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                changeLocale("pt-BR");
              }}
            >
              {t("Portuguese Brazil")}
            </CommandItem>
            <CommandItem
              onSelect={() => {
                changeLocale("en");
              }}
            >
              {t("English")}
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

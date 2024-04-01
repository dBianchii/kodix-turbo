"use client";

import { PiTranslate } from "react-icons/pi";

import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

import { useChangeLocale } from "~/locales/client";

export function I18nPicker() {
  const changeLocale = useChangeLocale();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className="size-8 p-1">
          <PiTranslate className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                changeLocale("pt");
              }}
            >
              Portuguese
            </CommandItem>
            <CommandItem
              onSelect={() => {
                changeLocale("en");
              }}
            >
              English
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

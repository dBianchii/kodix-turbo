"use client";

import * as React from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
  PlusIcon,
  TextIcon,
} from "@radix-ui/react-icons";

import { useTranslations } from "@kdx/locales/client";

import type { DataTableFilterOption } from "./types";
import { Button } from "../../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../command";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

interface DataTableFilterComboboxProps<TData> {
  options: DataTableFilterOption<TData>[];
  selectedOptions: DataTableFilterOption<TData>[];
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >;
  onSelect: () => void;
  children?: React.ReactNode;
}

export function DataTableFilterCombobox<TData>({
  options,
  selectedOptions,
  setSelectedOptions,
  onSelect,
  children,
}: DataTableFilterComboboxProps<TData>) {
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<
    DataTableFilterOption<TData>
  >(options[0] ?? ({} as DataTableFilterOption<TData>));
  const t = useTranslations();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            className="capitalize"
          >
            <CaretSortIcon
              className="mr-2 size-4 shrink-0"
              aria-hidden="true"
            />
            {t("Filter")}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="end">
        <Command>
          <CommandInput placeholder={t("Filter by")} />
          <CommandList>
            <CommandEmpty> {t("No item found")}</CommandEmpty>
            <CommandGroup>
              {options
                .filter(
                  (option) =>
                    !selectedOptions.some(
                      (selectedOption) => selectedOption.value === option.value,
                    ),
                )
                .map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    className="capitalize"
                    value={String(option.value)}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      setSelectedOption(option);
                      setSelectedOptions((prev) => {
                        return [...prev, { ...option }];
                      });
                      onSelect();
                    }}
                  >
                    {option.options.length > 0 ? (
                      <ChevronDownIcon
                        className="mr-2 size-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <TextIcon className="mr-2 size-4" aria-hidden="true" />
                    )}
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setSelectedOptions([
                    ...selectedOptions,
                    {
                      id: crypto.randomUUID(),
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      label: selectedOption.label ?? "",
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      value: selectedOption.value ?? "",
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      options: selectedOption.options ?? [],
                      isMulti: true,
                    },
                  ]);
                  onSelect();
                }}
              >
                <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                {t("Advanced filter")}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

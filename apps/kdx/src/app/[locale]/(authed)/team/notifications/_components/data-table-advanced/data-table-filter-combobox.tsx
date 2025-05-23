import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LuChevronDown,
  LuChevronsUpDown,
  LuPlus,
  LuType,
} from "react-icons/lu";

import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

import type { DataTableFilterOption } from "./types";

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
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
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
            <LuChevronsUpDown
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
                      <LuChevronDown
                        className="mr-2 size-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <LuType className="mr-2 size-4" aria-hidden="true" />
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
                <LuPlus className="mr-2 size-4" aria-hidden="true" />
                {t("Advanced filter")}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

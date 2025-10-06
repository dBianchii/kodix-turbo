import { useState } from "react";
import { Button } from "@kodix/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@kodix/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import { useTranslations } from "next-intl";
import {
  LuChevronDown,
  LuChevronsUpDown,
  LuPlus,
  LuType,
} from "react-icons/lu";

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
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button className="capitalize" size="sm" variant="outline">
            <LuChevronsUpDown
              aria-hidden="true"
              className="mr-2 size-4 shrink-0"
            />
            {t("Filter")}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[12.5rem] p-0">
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
                    className="capitalize"
                    key={String(option.value)}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      setSelectedOption(option);
                      setSelectedOptions((prev) => {
                        return [...prev, { ...option }];
                      });
                      onSelect();
                    }}
                    value={String(option.value)}
                  >
                    {option.options.length > 0 ? (
                      <LuChevronDown
                        aria-hidden="true"
                        className="mr-2 size-4"
                      />
                    ) : (
                      <LuType aria-hidden="true" className="mr-2 size-4" />
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
                      isMulti: true,

                      label: selectedOption.label ?? "",

                      options: selectedOption.options ?? [],

                      value: selectedOption.value ?? "",
                    },
                  ]);
                  onSelect();
                }}
              >
                <LuPlus aria-hidden="true" className="mr-2 size-4" />
                {t("Advanced filter")}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

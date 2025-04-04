"use client";

import type { z } from "zod";
import { useState } from "react";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from ".";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface OptionType {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange:
    | React.Dispatch<React.SetStateAction<string[]>>
    | ((value: string[]) => void);
  className?: string;
  customValues?: boolean;
  customValuesSchema?: z.ZodString;
  emptyMessage?: string;
  readonly?: boolean;
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  emptyMessage,
  customValues = false,
  customValuesSchema,
  readonly,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [customOptions, setCustomOptions] = useState<OptionType[]>([]);

  options = [...customOptions, ...options];

  const [commandInput, setCommandInput] = useState("");

  const handleUnselect = (item: string) => {
    if (customValues) {
      if (customOptions.some((opt) => opt.value === item)) {
        setCustomOptions(customOptions.filter((opt) => opt.value !== item));
      }
    }
    onChange(selected.filter((i) => i !== item));
  };

  let parseErrorMessage: string | undefined = "";
  if (customValues && customValuesSchema) {
    const result = customValuesSchema.safeParse(commandInput);
    if (!result.success) {
      parseErrorMessage = result.error.errors[0]?.message;
    }
  }
  const [showParseError, setShowParseError] = useState(false);
  const t = useTranslations();

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={readonly}
          aria-expanded={open}
          className={cn(
            `h-full min-h-10 w-full justify-between bg-transparent hover:bg-transparent`,
            className,
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((item) => (
              <Badge variant="secondary" key={item} className="mr-1 mb-1">
                {options.find((option) => option.value === item)?.label}
                <div
                  role="button"
                  tabIndex={0}
                  className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                </div>
              </Badge>
            ))}
            {!selected.length && (
              <span className="text-muted-foreground text-sm">
                {emptyMessage ?? `${t("Select")}...`}
              </span>
            )}
          </div>

          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`${t("Search")}...`}
            value={commandInput}
            onValueChange={setCommandInput}
          />
          <CommandEmpty>{t("Empty")}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(
                    selected.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value],
                  );
                  if (customOptions.includes(option)) {
                    setCustomOptions(
                      customOptions.filter((opt) => opt.value !== option.value),
                    );
                  }

                  setOpen(true);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    selected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
            {customValues && commandInput.length > 0 && (
              <CommandItem
                onSelect={() => {
                  if (customValuesSchema) {
                    const result = customValuesSchema.safeParse(commandInput);
                    if (!result.success) {
                      setShowParseError(!result.success);
                      return;
                    }
                  }

                  setShowParseError(false);
                  setCustomOptions([
                    ...customOptions,
                    { label: commandInput, value: commandInput },
                  ]);
                  onChange([...selected, commandInput]);
                  setCommandInput("");
                }}
                className="justify-between"
              >
                <div className="flex">
                  <PlusCircle className="text-muted-foreground mr-2 size-4" />
                  {t("Add")}
                  {"  "}
                  <span className="ml-1 text-sm">{commandInput}</span>
                </div>
                {showParseError &&
                  parseErrorMessage &&
                  parseErrorMessage.length > 0 && (
                    <p className="text-destructive ml-6 text-xs">
                      {parseErrorMessage}
                    </p>
                  )}
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };

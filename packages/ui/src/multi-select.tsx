import type { z } from "zod";
import * as React from "react";
import {
  CaretSortIcon,
  CheckIcon,
  Cross2Icon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";

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
import { cn } from "./utils";

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
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  customValues = false,
  customValuesSchema,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [customOptions, setCustomOptions] = React.useState<OptionType[]>([]);

  options = [...customOptions, ...options];

  const [commandInput, setCommandInput] = React.useState("");

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
  const [showParseError, setShowParseError] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(`h-full min-h-10 w-full justify-between`, className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((item) => (
              <Badge
                variant="outline"
                key={item}
                className="mb-1 mr-1"
                onClick={() => handleUnselect(item)}
              >
                {options.find((option) => option.value === item)?.label}
                <div
                  role="button"
                  tabIndex={0}
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                  <Cross2Icon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </div>
              </Badge>
            ))}
          </div>

          <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search ..."
            value={commandInput}
            onValueChange={setCommandInput}
          />
          <CommandEmpty>Vazio</CommandEmpty>
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
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
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
                  <PlusCircledIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  Add{"  "}
                  <span className="ml-1 text-sm">{commandInput}</span>
                </div>
                {showParseError &&
                  parseErrorMessage &&
                  parseErrorMessage.length > 0 && (
                    <p className="ml-6 text-xs text-destructive">
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
